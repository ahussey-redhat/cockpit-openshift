import cockpit from 'cockpit';
import React from 'react';
import { DEPLOY_STATES } from "../components/deployment-tab";

const _ = cockpit.gettext;

export const useDeployment = (scriptName) => {
    const [deploymentState, setDeploymentState] = React.useState(DEPLOY_STATES.UNKNOWN);
    const [deploymentOutput, setDeploymentOutput] = React.useState("");

    const deploy = React.useCallback(
        () => {
            if (deploymentState === DEPLOY_STATES.DEPLOYING) {
                return;
            }

            setDeploymentState(DEPLOY_STATES.DEPLOYING);
            cockpit.spawn([scriptName], { err: "out" })
                    .stream((data) => setDeploymentOutput((output) => output + data))
                    .then(() => setDeploymentState(DEPLOY_STATES.DEPLOYED))
                    .catch(() => setDeploymentState(DEPLOY_STATES.FAILED));
        },
        [deploymentState, scriptName]
    );

    return [deploy, deploymentState, deploymentOutput];
};
