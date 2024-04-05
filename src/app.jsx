import cockpit from 'cockpit';
import React from 'react';
import { Alert } from "@patternfly/react-core/dist/esm/components/Alert/index.js";
import { Button } from "@patternfly/react-core/dist/esm/components/Button/index.js";
import { Card, CardBody, CardTitle } from "@patternfly/react-core/dist/esm/components/Card/index.js";
import { Flex, FlexItem } from "@patternfly/react-core/dist/esm/layouts/Flex/index.js";
import { Stack, StackItem } from "@patternfly/react-core/dist/esm/layouts/Stack/index.js";
import { Tab, TabContent, TabContentBody, Tabs, TabTitleText } from "@patternfly/react-core/dist/esm/components/Tabs/index.js";
import { DeploymentAlert } from "./components/deployment-alert";
import { DeploymentTab, DEPLOY_STATES } from "./components/deployment-tab";
import { LogView } from "./components/log-view";
import { useDeployment } from "./hooks/use-deployment";

const _ = cockpit.gettext;

export const Application = () => {
    const [activeTabKey, setActiveTabKey] = React.useState(0);
    const handleTabClick = React.useCallback((_event, tabIndex) => setActiveTabKey(tabIndex), []);
    const [deployAdditionalServicesOutput, setDeployAdditionalServicesOutput] = React.useState("");
    const [deployAdditionalServicesState, setAdditionalServicesState] = React.useState(DEPLOY_STATES.UNKNOWN);

    const [deployOpenShiftSNOA, deploySNOAState, deploySNOAOutput] = useDeployment("deploy-sno-a");
    const [deployOpenShiftSNOB, deploySNOBState, deploySNOBOutput] = useDeployment("deploy-sno-b");
    const [deployCoreServices, deployCoreServicesState, deployCoreServicesOutput] = useDeployment("deploy-core-services");
    const [resetEnvironment, resetEnvironmentState, resetEnvironmentOutput] = useDeployment("reset-environment");

    // const [newAlertKey, setNewAlertKey] = React.useState(0);

    const deployOpenShift = React.useCallback(
        () => {
            deployOpenShiftSNOA();
            deployOpenShiftSNOB();
        },
        [deployOpenShiftSNOA, deployOpenShiftSNOB]
    );

    const deployAdditionalServices = React.useCallback(
        (service) => {
            if (deployAdditionalServicesState === DEPLOY_STATES.DEPLOYING) {
                return;
            }
            if (service === "medical") {
                setAdditionalServicesState(DEPLOY_STATES.DEPLOYING);
                cockpit.spawn(["echo", "deploying medical services"], { err: "out" })
                .stream((data) => setDeployAdditionalServicesOutput((output) => output + data))
                .then(() => setAdditionalServicesState(DEPLOY_STATES.DEPLOYED))
                .catch(() => setAdditionalServicesState(DEPLOY_STATES.FAILED));
                return;
            }
            if (service === "logistics") {
                setAdditionalServicesState(DEPLOY_STATES.DEPLOYING);
                cockpit.spawn(["echo", "deploying logistics services"], { err: "out" })
                .stream((data) => setDeployAdditionalServicesOutput((output) => output + data))
                .then(() => setAdditionalServicesState(DEPLOY_STATES.DEPLOYED))
                .catch(() => setAdditionalServicesState(DEPLOY_STATES.FAILED));
                return;
            }
            if (service === "mission") {
                setAdditionalServicesState(DEPLOY_STATES.DEPLOYING);
                cockpit.spawn(["echo", "deploying mission services"], { err: "out" })
                .stream((data) => setDeployAdditionalServicesOutput((output) => output + data))
                .then(() => setAdditionalServicesState(DEPLOY_STATES.DEPLOYED))
                .catch(() => setAdditionalServicesState(DEPLOY_STATES.FAILED));
                return;
            }
        },
        [deployAdditionalServicesState]
    );

    return (
        <Card>
            <CardTitle>OpenShift</CardTitle>
            <CardBody>
                <Stack hasGutter>
                    <StackItem>
                        <Button
                            isDisabled={deploySNOAState === DEPLOY_STATES.DEPLOYING || deploySNOBState === DEPLOY_STATES.DEPLOYING}
                            onClick={deployOpenShift}
                        >
                            {
                                _(
                                    deploySNOAState === DEPLOY_STATES.DEPLOYING && deploySNOBState === DEPLOY_STATES.DEPLOYING
                                        ? "Deploying to both sleds"
                                        : "Deploy OpenShift to both sleds"
                                )
                            }
                        </Button>
                    </StackItem>
                    <DeploymentAlert deploymentState={deploySNOAState} title="Deploying to sled 1" timeout={30000} />
                    <DeploymentAlert deploymentState={deploySNOBState} title="Deploying to sled 2" timeout={30000} />
                    <DeploymentAlert deploymentState={deployCoreServicesState} title="Deploying core services" timeout={30000} />
                    <DeploymentAlert deploymentState={deployAdditionalServicesState} title="Deploying additional services" timeout={30000} />
                    <DeploymentAlert deploymentState={resetEnvironmentState} title="Resetting Environment" timeout={10000} />
                    <StackItem>
                        <Tabs activeKey={activeTabKey} isBox onSelect={handleTabClick} unmountOnExit>
                            <Tab eventKey={0} title={<TabTitleText>{_("Sled 1")}</TabTitleText>}>
                                <TabContentBody hasPadding>
                                    <DeploymentTab
                                        deploymentState={deploySNOAState}
                                        deployingButtonText="Deploying to Sled 1"
                                        buttonText="Deploy OpenShift on Sled 1"
                                        onButtonClick={deployOpenShiftSNOA}
                                        logOutput={deploySNOAOutput}
                                    />
                                </TabContentBody>
                            </Tab>
                            <Tab eventKey={1} title={<TabTitleText>{_("Sled 2")}</TabTitleText>}>
                                <TabContentBody hasPadding>
                                    <DeploymentTab
                                        deploymentState={deploySNOBState}
                                        deployingButtonText="Deploying to Sled 2"
                                        buttonText="Deploy OpenShift on Sled 2"
                                        onButtonClick={deployOpenShiftSNOB}
                                        logOutput={deploySNOBOutput}
                                    />
                                </TabContentBody>
                            </Tab>
                            <Tab eventKey={2} title={<TabTitleText>{_("Core Services")}</TabTitleText>}>
                                <TabContentBody hasPadding>
                                    <DeploymentTab
                                        deploymentState={deployCoreServicesState}
                                        deployingButtonText="Deploying core services"
                                        buttonText="Deploy core services"
                                        onButtonClick={deployCoreServices}
                                        logOutput={deployCoreServicesOutput}
                                    />
                                </TabContentBody>
                            </Tab>
                            <Tab eventKey={3} title={<TabTitleText>{_("Additional Services")}</TabTitleText>}>
                                <TabContentBody hasPadding>
                                    <Stack hasGutter>
                                        <StackItem>
                                            <Flex>
                                                <FlexItem>
                                                    <Button
                                                        isDisabled={deployAdditionalServicesState === DEPLOY_STATES.DEPLOYING}
                                                        onClick={() => deployAdditionalServices("medical")}
                                                    >
                                                        {
                                                            _(
                                                                deployAdditionalServicesState === DEPLOY_STATES.DEPLOYING
                                                                    ? "Deploying medical services"
                                                                    : "Deploy medical services"
                                                            )
                                                        }
                                                    </Button>
                                                </FlexItem>
                                                <FlexItem>
                                                    <Button
                                                        isDisabled={deployAdditionalServicesState === DEPLOY_STATES.DEPLOYING}
                                                        onClick={() => deployAdditionalServices("logistics")}
                                                    >
                                                        {
                                                            _(
                                                                deployAdditionalServicesState === DEPLOY_STATES.DEPLOYING
                                                                    ? "Deploying logistics services"
                                                                    : "Deploy logistics services"
                                                            )
                                                        }
                                                    </Button>
                                                </FlexItem>
                                                <FlexItem>
                                                    <Button
                                                        isDisabled={deployAdditionalServicesState === DEPLOY_STATES.DEPLOYING}
                                                        onClick={() => deployAdditionalServices("mission")}
                                                    >
                                                        {
                                                            _(
                                                                deployAdditionalServicesState === DEPLOY_STATES.DEPLOYING
                                                                    ? "Deploying mission services"
                                                                    : "Deploy mission services"
                                                            )
                                                        }
                                                    </Button>
                                                </FlexItem>
                                            </Flex>
                                        </StackItem>
                                        <StackItem>
                                            <LogView data={deployAdditionalServicesOutput} />
                                        </StackItem>
                                    </Stack>
                                </TabContentBody>
                            </Tab>
                            <Tab eventKey={4} title={<TabTitleText>{_("Reset Environment")}</TabTitleText>}>
                                <TabContentBody hasPadding>
                                    <DeploymentTab
                                        deploymentState={resetEnvironmentState}
                                        deployingButtonText="Resetting environment"
                                        buttonText="Reset environment"
                                        onButtonClick={resetEnvironment}
                                        logOutput={resetEnvironmentOutput}
                                    />
                                </TabContentBody>
                            </Tab>
                        </Tabs>
                    </StackItem>
                </Stack>
            </CardBody>
        </Card>
    );
};
