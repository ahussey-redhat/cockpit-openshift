/*
 * This file is part of Cockpit.
 *
 * Copyright (C) 2017 Red Hat, Inc.
 *
 * Cockpit is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or
 * (at your option) any later version.
 *
 * Cockpit is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Cockpit; If not, see <http://www.gnu.org/licenses/>.
 */

import cockpit from 'cockpit';
import React from 'react';
import { Alert } from "@patternfly/react-core/dist/esm/components/Alert/index.js";
import { Button } from "@patternfly/react-core/dist/esm/components/Button/index.js";
import { Card, CardBody, CardTitle } from "@patternfly/react-core/dist/esm/components/Card/index.js";
import { Flex, FlexItem } from "@patternfly/react-core/dist/esm/layouts/Flex/index.js";
import { Stack, StackItem } from "@patternfly/react-core/dist/esm/layouts/Stack/index.js";
import { LogView } from "./components/log-view";

const _ = cockpit.gettext;

const DEPLOY_STATES = {
    UNKNOWN: "unknown",
    DEPLOYING: "deploying",
    DEPLOYED: "deployed",
    FAILED: "failed"
};

const ALERT_DEPLOY_STATE_MAP = {
    [DEPLOY_STATES.DEPLOYED]: "success",
    [DEPLOY_STATES.FAILED]: "danger",
};

export const Application = () => {
    const [hostname, setHostname] = React.useState(_("Unknown"));
    const [deployState, setDeployState] = React.useState(DEPLOY_STATES.UNKNOWN);
    const [output, setOutput] = React.useState("");
    const [deploySNOAState, setSNOADeployState] = React.useState(DEPLOY_STATES.UNKNOWN);
    const [deploySNOBState, setSNOBDeployState] = React.useState(DEPLOY_STATES.UNKNOWN);

    React.useEffect(() => {
        cockpit.file('/etc/hostname').watch(content => {
            setHostname(content.trim());
        });
    }, []);

    const deployOpenShift = React.useCallback(
        () => {
            if (deployState === DEPLOY_STATES.DEPLOYING) {
                return;
            }

            setDeployState(DEPLOY_STATES.DEPLOYING);
            cockpit.spawn(["deploy-openshift-all-nodes"], { err: "message" })
                    .stream((data) => setOutput((output) => output + data))
                    .then(() => setDeployState(DEPLOY_STATES.DEPLOYED))
                    .catch(() => setDeployState(DEPLOY_STATES.FAILED));
        },
        [deployState]
    );

    const deployOpenShiftSNOA = React.useCallback(
        () => {
            if (deploySNOAState === DEPLOY_STATES.DEPLOYING) {
                return;
            }

            setSNOADeployState(DEPLOY_STATES.DEPLOYING);
            cockpit.spawn(["deploy-sno-a"], { err: "message" })
                    .stream((data) => setOutput((output) => output + data))
                    .then(() => setSNOADeployState(DEPLOY_STATES.DEPLOYED))
                    .catch(({ message }, maybeStdErr) => {
                        console.log(`message: ${message}`);
                        console.log(`maybeStdErr: ${maybeStdErr}`);
                        setSNOADeployState(DEPLOY_STATES.FAILED);
                    });
        },
        [deploySNOAState]
    );

    const deployOpenShiftSNOB = React.useCallback(
        () => {
            if (deploySNOBState === DEPLOY_STATES.DEPLOYING) {
                return;
            }

            setSNOBDeployState(DEPLOY_STATES.DEPLOYING);
            cockpit.spawn(["deploy-sno-b"], { err: "out" })
                    .stream((data) => setOutput((output) => output + data))
                    .then(() => setSNOBDeployState(DEPLOY_STATES.DEPLOYED))
                    .catch(() => setSNOBDeployState(DEPLOY_STATES.FAILED));
        },
        [deploySNOBState]
    );

    return (
        <Card>
            <CardTitle>OpenShift Provisioning</CardTitle>
            <CardBody>
                <Stack hasGutter>
                    <StackItem>
                        <Flex>
                            <FlexItem>
                                <Button
                                    isDisabled={deployState === DEPLOY_STATES.DEPLOYING || deploySNOAState === DEPLOY_STATES.DEPLOYING || deploySNOBState === DEPLOY_STATES.DEPLOYING}
                                    onClick={deployOpenShift}
                                >
                                    {
                                        _(
                                            deployState === DEPLOY_STATES.DEPLOYING
                                                ? "Deploying to both Sleds"
                                                : "Deploy OpenShift on both Sleds"
                                        )
                                    }
                                </Button>
                            </FlexItem>
                            <FlexItem>
                                <Button
                                    isDisabled={deploySNOAState === DEPLOY_STATES.DEPLOYING}
                                    onClick={deployOpenShiftSNOA}
                                >
                                    {
                                        _(
                                            deploySNOAState === DEPLOY_STATES.DEPLOYING
                                                ? "Deploying to Sled 1"
                                                : "Deploy OpenShift on Sled 1"
                                        )
                                    }
                                </Button>
                            </FlexItem>
                            <FlexItem>
                                <Button
                                    isDisabled={deploySNOBState === DEPLOY_STATES.DEPLOYING}
                                    onClick={deployOpenShiftSNOB}
                                >
                                    {
                                        _(
                                            deploySNOBState === DEPLOY_STATES.DEPLOYING
                                                ? "Deploying to Sled 2"
                                                : "Deploy OpenShift on Sled 2"
                                        )
                                    }
                                </Button>
                            </FlexItem>
                        </Flex>
                    </StackItem>
                    {
                        deployState === DEPLOY_STATES.UNKNOWN
                            ? null
                            : (
                                <StackItem>
                                    <Alert
                                        variant={ALERT_DEPLOY_STATE_MAP[deployState] ?? "info"}
                                        title={ cockpit.format(_("Deploying to both sleds")) }
                                    />
                                </StackItem>
                            )
                    }
                    {
                        deploySNOAState === DEPLOY_STATES.UNKNOWN
                            ? null
                            : (
                                <StackItem>
                                    <Alert
                                        variant={ALERT_DEPLOY_STATE_MAP[deploySNOAState] ?? "info"}
                                        title={ cockpit.format(_("Deploying to sled 1")) }
                                    />
                                </StackItem>
                            )
                    }
                    {
                        deploySNOBState === DEPLOY_STATES.UNKNOWN
                            ? null
                            : (
                                <StackItem>
                                    <Alert
                                        variant={ALERT_DEPLOY_STATE_MAP[deploySNOBState] ?? "info"}
                                        title={ cockpit.format(_("Deploying to sled 2")) }
                                    />
                                </StackItem>
                            )
                    }
                    {
                        output.length > 0
                            ? (
                                <StackItem>
                                    <LogView data={output} />
                                </StackItem>
                            )
                            : null
                    }
                </Stack>
            </CardBody>
        </Card>
    );
};