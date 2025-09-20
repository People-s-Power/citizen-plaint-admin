import React, { Fragment } from 'react';
import FrontLayout from "@/components/Layout";

const privacy = () => {
    return (
        <Fragment>
            <title>Privacy</title>
            <FrontLayout>

                    <div className="flex justify-center py-4">
                        <iframe className="w-full max-w-4xl" height="3500" src="https://docs.google.com/document/d/e/2PACX-1vS9WeduCRmpPm5qsOAe_5cmr51I2nP1UJj7eHa9DjH9oyGBKjsPMrxrhkv2gSbESphBR6e-BllV0Vx8/pub?embedded=true"></iframe>
                    </div>
            </FrontLayout>
        </Fragment>
    );
};

export default privacy;