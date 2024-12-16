import './Check.css'

const Check = (props) =>
{
    return(
        <div>
            <img className='check' src={props.check}></img>
        </div>
    )
}

export default Check
