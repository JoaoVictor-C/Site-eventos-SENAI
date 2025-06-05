using System.Security.Cryptography;
using EventosAPI.Domain.Interfaces.Services;

namespace EventosAPI.Infrastructure.Security;

public class PasswordService : IPasswordService
{
    private const int SaltSize = 16; // 128 bit
    private const int KeySize = 32; // 256 bit
    private const int Iterations = 100000;
    private static readonly HashAlgorithmName HashAlgorithmName = HashAlgorithmName.SHA256;
    private const char Delimiter = ';';

    public string Hash(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName, KeySize);
        
        return string.Join(Delimiter, 
            Convert.ToBase64String(salt),
            Convert.ToBase64String(hash));
    }

    public bool Verify(string password, string hashString)
    {
        var elements = hashString.Split(Delimiter);
        var salt = Convert.FromBase64String(elements[0]);
        var hash = Convert.FromBase64String(elements[1]);

        var hashToCompare = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName, KeySize);
        
        return CryptographicOperations.FixedTimeEquals(hash, hashToCompare);
    }
}
