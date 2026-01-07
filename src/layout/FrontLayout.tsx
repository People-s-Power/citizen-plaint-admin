import React, { Fragment, ReactNode, useState, useEffect } from "react";
import HeaderComp from "../components/HeaderComp";
import PropTypes from "prop-types";

interface IProps {
	showFooter?: boolean;
	children: ReactNode;
	showHeader?: boolean;
	msg?: boolean;
}

const FrontLayout: React.FC<IProps> = ({
	showFooter,
	children,
	showHeader,
	msg
}: IProps): React.ReactElement => {
	const text = `EXPERTHUB`
	const [show, setShow] = useState(msg)

	useEffect(() => {
		if (window.innerWidth < 768) {
			setShow(false)
		}
	}, [])

	return (
		<Fragment>
			<title>{text}</title>
			<div className="front">
				{showHeader === false ? null : <HeaderComp />}
				<div className="children">{children}</div>
			</div>
		</Fragment>
	);
};

export default FrontLayout;
