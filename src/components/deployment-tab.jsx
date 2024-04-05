import cockpit from "cockpit";
import React from "react";
import { Button } from "@patternfly/react-core/dist/esm/components/Button/index.js";
import { Stack, StackItem } from "@patternfly/react-core/dist/esm/layouts/Stack/index.js";
import { LogView } from "./log-view";

const _ = cockpit.gettext;

export const DEPLOY_STATES = {
    UNKNOWN: "unknown",
    DEPLOYING: "deploying",
    DEPLOYED: "deployed",
    FAILED: "failed"
};

export const DeploymentTab = ({
    deploymentState,
    deployingButtonText,
    buttonText,
    onButtonClick,
    logOutput
}) => (
    <Stack hasGutter>
        <StackItem>
            <Button isDisabled={deploymentState === DEPLOY_STATES.DEPLOYING} onClick={onButtonClick}>
                {_(deploymentState === DEPLOY_STATES.DEPLOYING ? deployingButtonText : buttonText)}
            </Button>
        </StackItem>
        <StackItem>
            <LogView data={logOutput} />
        </StackItem>
    </Stack>
);
