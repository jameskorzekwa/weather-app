import React, { Fragment, useEffect, useState } from 'react';
import styled from 'styled-components';
import {
    Button,
    Dialog,
    DialogBody,
    DialogFooter,
    DialogHeader,
    Input,
    Option,
    Select
} from '@material-tailwind/react';
import { WeatherSource } from '@/types';

const SettingsWrapper = styled.div`
    height: 75px;
    width: 75px;
    position: absolute;
    top: 0;
`;

interface Props {
    settingsOpen: boolean;
    setSettingsOpen: (state: boolean) => void;
    zipcode?: string;
    setZipcode: (state: string) => void;
    apikey?: string;
    setApikey: (state: string) => void;
    token?: string;
    setToken: (state: string) => void;
    secretKey?: string;
    setSecretKey: (state: string) => void;
    weatherSource?: WeatherSource;
    setWeatherSource: (state: WeatherSource) => void;
    appid?: string;
    setAppid: (state: string) => void;
}

export default function Settings({
    settingsOpen,
    setSettingsOpen,
    zipcode,
    setZipcode,
    apikey,
    setApikey,
    token,
    setToken,
    secretKey,
    setSecretKey,
    weatherSource,
    setWeatherSource,
    appid,
    setAppid
}: Props) {
    const [formZipcode, setFormZipcode] = useState<string | undefined>(zipcode);
    const [formApikey, setFormApikey] = useState<string | undefined>(apikey);
    const [formToken, setFormToken] = useState<string | undefined>(token);
    const [formSecretKey, setFormSecretKey] = useState<string | undefined>(
        secretKey
    );
    const [formWeatherSource, setFormWeatherSource] = useState<
        WeatherSource | undefined
    >(weatherSource);
    const [formAppid, setFormAppid] = useState<string | undefined>(appid);

    const onSave = () => {
        setZipcode(formZipcode || '');
        setApikey(formApikey || '');
        setSecretKey(formSecretKey || '');
        setToken(formToken || '');
        setWeatherSource(formWeatherSource || 'OpenMeteo');
        setAppid(formAppid || '');
        setSettingsOpen(false);
    };
    useEffect(() => {
        setFormZipcode(zipcode);
    }, [zipcode]);

    useEffect(() => {
        setFormApikey(apikey);
    }, [apikey]);
    useEffect(() => {
        setFormSecretKey(secretKey);
    }, [secretKey]);

    useEffect(() => {
        setFormToken(token);
    }, [token]);
    useEffect(() => {
        setFormWeatherSource(weatherSource);
    }, [weatherSource]);
    useEffect(() => {
        setFormAppid(appid);
    }, [appid]);
    return (
        <Fragment>
            <SettingsWrapper onClick={() => setSettingsOpen(true)} />
            <Dialog
                open={settingsOpen}
                handler={() => setSettingsOpen(!settingsOpen)}
                className={'p-4'}
            >
                <DialogHeader>Settings</DialogHeader>
                <DialogBody>
                    <div className="flex flex-col gap-6">
                        <div className="w-72">
                            <Input
                                label="Zipcode"
                                crossOrigin={undefined}
                                value={formZipcode}
                                onChange={({ target }) =>
                                    setFormZipcode(target.value)
                                }
                            />
                        </div>
                        <div className="w-72">
                            <Input
                                label="Geoapify API Key"
                                crossOrigin={undefined}
                                value={formApikey}
                                onChange={({ target }) =>
                                    setFormApikey(target.value)
                                }
                            />
                        </div>
                        <div className="w-72">
                            <Input
                                label="Switchbot Secret Key"
                                crossOrigin={undefined}
                                value={formSecretKey}
                                onChange={({ target }) =>
                                    setFormSecretKey(target.value)
                                }
                            />
                        </div>
                        <div className="w-72">
                            <Input
                                label="Switchbot Token"
                                crossOrigin={undefined}
                                value={formToken}
                                onChange={({ target }) =>
                                    setFormToken(target.value)
                                }
                            />
                        </div>
                        <div className="w-72">
                            <Select
                                label="Select Weather Source"
                                value={formWeatherSource}
                                onChange={(val) =>
                                    setFormWeatherSource(val as WeatherSource)
                                }
                            >
                                <Option value="OpenWeatherMap">
                                    OpenWeatherMap
                                </Option>
                                <Option value="OpenMeteo">OpenMeteo</Option>
                            </Select>
                        </div>
                        {formWeatherSource === 'OpenWeatherMap' && (
                            <div className="w-72">
                                <Input
                                    label="OWM App ID"
                                    crossOrigin={undefined}
                                    value={formAppid}
                                    onChange={({ target }) =>
                                        setFormAppid(target.value)
                                    }
                                />
                            </div>
                        )}
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button
                        variant="text"
                        onClick={() => setSettingsOpen(false)}
                        className="mr-1"
                    >
                        <span>Cancel</span>
                    </Button>
                    <Button variant="gradient" color="blue" onClick={onSave}>
                        <span>Save</span>
                    </Button>
                </DialogFooter>
            </Dialog>
        </Fragment>
    );
}
