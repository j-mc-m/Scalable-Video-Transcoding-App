import React from "react";
import { Navbar, NavbarBrand } from "reactstrap";
import { NavLink as RRNavLink } from 'react-router-dom'; // thanks to Stackoverflow eddywashere - https://stackoverflow.com/a/42373843

export default function Header(props) {
    return (
        <div>
            <Navbar light className="bg-custom">
                <NavbarBrand to="/" tag={RRNavLink}>Video Converter</NavbarBrand>
            </Navbar>
        </div>
    );
}
