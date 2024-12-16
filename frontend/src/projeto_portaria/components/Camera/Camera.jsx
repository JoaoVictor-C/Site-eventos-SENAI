import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import './CameraIcon.css'; 

const Camera = (props) => {
    return (
        <div className="container mt-3">
            <div className="row justify-content-center">
                <div className="col-6">
                    <img className='img-fluid' src={props.camera} alt='Camera' />
                </div>
            </div>
        </div>
    );
}

export default Camera;
