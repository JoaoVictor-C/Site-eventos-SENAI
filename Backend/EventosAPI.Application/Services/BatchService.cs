using AutoMapper;
using EventosAPI.Application.DTOs;
using EventosAPI.Application.Exceptions;
using EventosAPI.Domain.Entities;
using EventosAPI.Domain.Enums;
using EventosAPI.Domain.Interfaces.Repositories;
using EventosAPI.Application.Interfaces;
using FluentValidation;
using ValidationException = EventosAPI.Application.Exceptions.ValidationException;

namespace EventosAPI.Application.Services
{
    public class BatchService : IBatchService
    {
        private readonly IBatchRepository _batchRepository;
        private readonly IEventRepository _eventRepository;
        private readonly IMapper _mapper;
        private readonly IValidator<CreateBatchDto> _createValidator;
        private readonly IValidator<UpdateBatchDto> _updateValidator;

        public BatchService(
            IBatchRepository batchRepository,
            IEventRepository eventRepository,
            IMapper mapper,
            IValidator<CreateBatchDto> createValidator,
            IValidator<UpdateBatchDto> updateValidator)
        {
            _batchRepository = batchRepository;
            _eventRepository = eventRepository;
            _mapper = mapper;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        public async Task<BatchDto> CreateAsync(CreateBatchDto createBatchDto)
        {            // Validate DTO
            var validationResult = await _createValidator.ValidateAsync(createBatchDto);
            if (!validationResult.IsValid)
                throw new ValidationException(validationResult.Errors.ToDictionary(
                    e => e.PropertyName,
                    e => new[] { e.ErrorMessage }
                ));

            // Get event and validate it exists
            var event_ = await _eventRepository.GetByIdAsync(createBatchDto.EventId)
                ?? throw new NotFoundException(nameof(Event), createBatchDto.EventId);

            // Create batch entity
            var batch = _mapper.Map<Batch>(createBatchDto);
            batch.Stock = createBatchDto.TotalQuantity; // Initial stock equals total quantity

            // Domain validation
            if (!batch.Validate(out var errors))
                throw new ValidationException(errors);

            // Save batch
            batch = await _batchRepository.CreateAsync(batch);
            return _mapper.Map<BatchDto>(batch);
        }

        public async Task<BatchDto> UpdateAsync(Guid id, UpdateBatchDto updateBatchDto)
        {            // Validate DTO
            var validationResult = await _updateValidator.ValidateAsync(updateBatchDto);
            if (!validationResult.IsValid)
                throw new ValidationException(validationResult.Errors.ToDictionary(
                    e => e.PropertyName,
                    e => new[] { e.ErrorMessage }
                ));

            // Get batch and validate it exists
            var batch = await _batchRepository.GetByIdAsync(id)
                ?? throw new NotFoundException(nameof(Batch), id);

            // Don't allow updates if batch has ended
            if (batch.HasEnded)
                throw new BusinessRuleException("Cannot update a batch that has ended");

            // Don't allow updates if batch has sold tickets
            if (batch.Tickets.Any(t => t.Status != TicketStatus.Canceled))
                throw new BusinessRuleException("Cannot update a batch that has sold tickets");

            // Update batch properties
            _mapper.Map(updateBatchDto, batch);

            // If total quantity is updated, update stock accordingly
            if (updateBatchDto.TotalQuantity.HasValue)
            {
                var soldTickets = batch.TotalQuantity - batch.Stock;
                batch.Stock = updateBatchDto.TotalQuantity.Value - soldTickets;
            }

            // Domain validation
            if (!batch.Validate(out var errors))
                throw new ValidationException(errors);

            // Save changes
            await _batchRepository.UpdateAsync(batch);
            
            // Reload batch with relationships
            batch = await _batchRepository.GetByIdAsync(id)
                ?? throw new BusinessRuleException("Failed to retrieve updated batch");

            return _mapper.Map<BatchDto>(batch);
        }

        public async Task<BatchDto?> GetByIdAsync(Guid id)
        {
            var batch = await _batchRepository.GetByIdAsync(id);
            return batch != null ? _mapper.Map<BatchDto>(batch) : null;
        }

        public async Task<IEnumerable<BatchDto>> GetByEventIdAsync(Guid eventId)
        {
            var batches = await _batchRepository.GetEventBatchesAsync(eventId);
            return _mapper.Map<IEnumerable<BatchDto>>(batches);
        }

        public async Task DeleteAsync(Guid id)
        {
            var batch = await _batchRepository.GetByIdAsync(id)
                ?? throw new NotFoundException(nameof(Batch), id);

            // Don't allow deletion if batch has sold tickets
            if (batch.Tickets.Any(t => t.Status != TicketStatus.Canceled))
                throw new BusinessRuleException("Cannot delete a batch that has sold tickets");

            await _batchRepository.DeleteAsync(id);
        }
    }
}
