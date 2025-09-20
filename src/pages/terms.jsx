import React, { Fragment } from 'react';
import FrontLayout from "@/components/Layout";

const terms = () => {
    return (
        <Fragment>
            <title>Terms And Conditions</title>
            <FrontLayout>
                    <div className="flex justify-center py-4">
                        {/* <ReactMarkdown>{terms?.body}</ReactMarkdown> */}
                        <iframe className="w-full max-w-4xl" height="3500" src="https://docs.google.com/document/d/e/2PACX-1vSZxnjx1NPklNew0-ytqATLRRZBl97ei6RQ_QgopAERLYPDAPABdJrm50U0hePA7F5T7vJ5PJdqlyNZ/pub?embedded=true"></iframe>
                    </div>
            </FrontLayout>
        </Fragment>
    );
};

export default terms;