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
import { FakeWeatherKey, WeatherSource } from '@/types';
import { fakeWeather } from '@/constants/data';
import InputWrapper from '@/components/inputwrapper';

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
    spoofWeather?: FakeWeatherKey;
    setSpoofWeather: (state: FakeWeatherKey | undefined) => void;
}

type Form = {
    zipcode: { value?: string; error?: string };
    apikey: { value?: string; error?: string };
    token: { value?: string; error?: string };
    secretKey: { value?: string; error?: string };
    weatherSource: { value?: WeatherSource; error?: string };
    appid: { value?: string; error?: string };
    spoofWeather: { value: FakeWeatherKey | 'actual'; error?: string };
};

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
    setAppid,
    spoofWeather,
    setSpoofWeather
}: Props) {
    const [form, setForm] = useState<Form>({
        zipcode: { value: zipcode, error: undefined },
        apikey: { value: apikey, error: undefined },
        token: { value: token, error: undefined },
        secretKey: { value: secretKey, error: undefined },
        weatherSource: { value: weatherSource, error: undefined },
        appid: { value: appid, error: undefined },
        spoofWeather: { value: spoofWeather || 'actual', error: undefined }
    });

    const validate = (): boolean => {
        let valid = true;

        setForm((prevForm) => {
            const tempForm: Form = { ...prevForm };
            Object.keys(prevForm).forEach((key) => {
                // @ts-ignore
                tempForm[key] = { ...prevForm[key], error: undefined };
            });

            if (!tempForm.zipcode.value) {
                tempForm.zipcode.error = 'Zipcode required';
            }

            if (!tempForm.apikey.value) {
                tempForm.apikey.error = 'Geoapify API Key required';
            }

            if (tempForm.weatherSource.value === 'OpenWeatherMap') {
                if (!tempForm.appid.value) {
                    tempForm.appid.error =
                        'OWM App ID required for OpenWeatherMap';
                }
            }
            for (const [_, value] of Object.entries(tempForm)) {
                if (value.error) {
                    valid = false;
                }
            }
            return { ...tempForm };
        });

        return valid;
    };

    const onSave = () => {
        if (validate()) {
            setZipcode(form.zipcode.value || '');
            setApikey(form.apikey.value || '');
            setSecretKey(form.secretKey.value || '');
            setToken(form.token.value || '');
            setWeatherSource(form.weatherSource.value || 'OpenMeteo');
            setAppid(form.appid.value || '');
            setSpoofWeather(
                form.spoofWeather.value === 'actual'
                    ? undefined
                    : form.spoofWeather.value
            );
            setSettingsOpen(false);
        }
    };

    useEffect(() => {
        setForm((prevState) => ({
            ...prevState,
            zipcode: { ...form.zipcode, value: zipcode }
        }));
    }, [zipcode]);

    useEffect(() => {
        setForm((prevState) => ({
            ...prevState,
            apikey: { ...form.apikey, value: apikey }
        }));
    }, [apikey]);
    useEffect(() => {
        setForm((prevState) => ({
            ...prevState,
            secretKey: { ...form.secretKey, value: secretKey }
        }));
    }, [secretKey]);

    useEffect(() => {
        setForm((prevState) => ({
            ...prevState,
            token: { ...form.token, value: token }
        }));
    }, [token]);
    useEffect(() => {
        setForm((prevState) => ({
            ...prevState,
            weatherSource: { ...form.weatherSource, value: weatherSource }
        }));
    }, [weatherSource]);
    useEffect(() => {
        setForm((prevState) => ({
            ...prevState,
            appid: { ...form.appid, value: appid }
        }));
    }, [appid]);
    useEffect(() => {
        setForm((prevState) => ({
            ...prevState,
            spoofWeather: {
                ...form.spoofWeather,
                value: spoofWeather || 'actual'
            }
        }));
    }, [spoofWeather]);

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
                    <div className="flex flex-row gap-4">
                        <div className="flex flex-col gap-6">
                            <div className="w-72">
                                <InputWrapper error={form.zipcode.error}>
                                    <Input
                                        label="Zipcode"
                                        crossOrigin={undefined}
                                        value={form.zipcode.value}
                                        error={!!form.zipcode.error}
                                        onChange={({ target }) =>
                                            setForm((form) => ({
                                                ...form,
                                                zipcode: {
                                                    ...form.zipcode,
                                                    value: target.value
                                                }
                                            }))
                                        }
                                    />
                                </InputWrapper>
                            </div>
                            <div className="w-72">
                                <InputWrapper error={form.apikey.error}>
                                    <Input
                                        label="Geoapify API Key"
                                        crossOrigin={undefined}
                                        value={form.apikey.value}
                                        error={!!form.apikey.error}
                                        onChange={({ target }) =>
                                            setForm((form) => ({
                                                ...form,
                                                apikey: {
                                                    ...form.apikey,
                                                    value: target.value
                                                }
                                            }))
                                        }
                                    />
                                </InputWrapper>
                            </div>
                            <div className="w-72">
                                <InputWrapper error={form.secretKey.error}>
                                    <Input
                                        label="Switchbot Secret Key"
                                        crossOrigin={undefined}
                                        value={form.secretKey.value}
                                        error={!!form.secretKey.error}
                                        onChange={({ target }) =>
                                            setForm((form) => ({
                                                ...form,
                                                secretKey: {
                                                    ...form.secretKey,
                                                    value: target.value
                                                }
                                            }))
                                        }
                                    />
                                </InputWrapper>
                            </div>
                            <div className="w-72">
                                <InputWrapper error={form.token.error}>
                                    <Input
                                        label="Switchbot Token"
                                        crossOrigin={undefined}
                                        value={form.token.value}
                                        error={!!form.token.error}
                                        onChange={({ target }) =>
                                            setForm((form) => ({
                                                ...form,
                                                token: {
                                                    ...form.token,
                                                    value: target.value
                                                }
                                            }))
                                        }
                                    />
                                </InputWrapper>
                            </div>
                            <div className="w-72">
                                <InputWrapper error={form.weatherSource.error}>
                                    <Select
                                        label="Select Weather Source"
                                        value={form.weatherSource.value}
                                        error={!!form.weatherSource.error}
                                        onChange={(val) =>
                                            setForm((form) => ({
                                                ...form,
                                                weatherSource: {
                                                    ...form.weatherSource,
                                                    value: val as WeatherSource
                                                }
                                            }))
                                        }
                                    >
                                        <Option value="OpenWeatherMap">
                                            OpenWeatherMap
                                        </Option>
                                        <Option value="OpenMeteo">
                                            OpenMeteo
                                        </Option>
                                    </Select>
                                </InputWrapper>
                            </div>
                            {form.weatherSource.value === 'OpenWeatherMap' && (
                                <div className="w-72">
                                    <InputWrapper error={form.appid.error}>
                                        <Input
                                            label="OWM App ID"
                                            crossOrigin={undefined}
                                            value={form.appid.value}
                                            onChange={({ target }) =>
                                                setForm((form) => ({
                                                    ...form,
                                                    appid: {
                                                        ...form.appid,
                                                        value: target.value
                                                    }
                                                }))
                                            }
                                        />
                                    </InputWrapper>
                                </div>
                            )}
                        </div>
                        <div className="w-72">
                            <InputWrapper error={form.spoofWeather.error}>
                                <Select
                                    label="Select Current Weather"
                                    value={form.spoofWeather.value}
                                    error={!!form.spoofWeather.error}
                                    onChange={(val) =>
                                        setForm((form) => ({
                                            ...form,
                                            spoofWeather: {
                                                ...form.spoofWeather,
                                                value: val as
                                                    | FakeWeatherKey
                                                    | 'actual'
                                            }
                                        }))
                                    }
                                >
                                    {[
                                        <Option key="actual" value="actual">
                                            Actual Weather
                                        </Option>,
                                        ...Object.keys(fakeWeather).map(
                                            (key) => {
                                                return (
                                                    <Option
                                                        key={key}
                                                        value={key}
                                                    >
                                                        {fakeWeather[
                                                            key as FakeWeatherKey
                                                        ]?.description ||
                                                            'Actual Weather'}
                                                    </Option>
                                                );
                                            }
                                        )
                                    ]}
                                </Select>
                            </InputWrapper>
                        </div>
                        <div className="flex flex-col gap-6"></div>
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
