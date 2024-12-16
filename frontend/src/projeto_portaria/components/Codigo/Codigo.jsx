import '../Codigo/codigo.css'

const Codigo = (props) =>
{
    return(
        <>
        <div className='codigo'>
            <label>{props.label}</label>
            <input placeholder={props.place}/>
        </div>

        </>
    )
}
export default Codigo;