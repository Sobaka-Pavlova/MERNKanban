import React from "react";

import "./LoadingSpinner.scss";

const LoadingSpinner = props => {
	return (
		<div className='centered'>
			<div className={`${props.asOverlay && "loading-spinner__overlay"}`}>
				<div className="lds-dual-ring"></div>
			</div>
		</div>
	);
};

export default LoadingSpinner;
