import './Alert.css'

const Alert = (props) =>
{
    return(
        <div>
            <img className='alert' src={props.alert}></img>
        </div>
    )
}

export default Alert