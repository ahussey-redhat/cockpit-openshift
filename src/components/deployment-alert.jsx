import cockpit from 'cockpit';
import React from 'react';
import { Alert, AlertActionCloseButton } from "@patternfly/react-core/dist/esm/components/Alert/index.js";
import { StackItem } from "@patternfly/react-core/dist/esm/layouts/Stack/index.js";
import { DEPLOY_STATES } from "./deployment-tab";

const _ = cockpit.gettext;

const ALERT_DEPLOY_STATE_MAP = {
    [DEPLOY_STATES.DEPLOYED]: "success",
    [DEPLOY_STATES.FAILED]: "danger",
};

export const DeploymentAlert = ({ deploymentState, title, timeout }) =>
    deploymentState === DEPLOY_STATES.UNKNOWN
        ? null
        : (
            <StackItem>
                <Alert
                    variant={ALERT_DEPLOY_STATE_MAP[deploymentState] ?? "info"}
                    title={cockpit.format(_(title))}
                    timeout={timeout}
                    // key={setNewAlertKey((currentAlertKey) => currentAlertKey + 1)}
                    actionClose={
                        <AlertActionCloseButton
                        //   title={title}
                        //   variantLabel={ALERT_DEPLOY_STATE_MAP[deploymentState] ?? "info"}
                        //   onClose={() => removeAlert(key)}
                        />
                      }
                />
            </StackItem>
        );
