import React, { Fragment, useEffect, useState } from 'react';
import styled from 'styled-components';
import {
    Button,
    Checkbox,
    Dialog,
    DialogBody,
    DialogFooter,
    DialogHeader,
    Input,
    Option,
    Select,
    Spinner
} from '@material-tailwind/react';
import { FakeWeatherKey, LatLon, WeatherSource } from '@/types';
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
    latlon?: LatLon;
    setLatlon: (state: LatLon | undefined) => void;
    zipcode?: string;
    setZipcode: (state: string) => void;
    apikey?: string;
    setApikey: (state: string) => void;
    applicationKey?: string;
    setApplicationKey: (state: string) => void;
    apiKey?: string;
    setApiKey: (state: string) => void;
    weatherSource?: WeatherSource;
    setWeatherSource: (state: WeatherSource) => void;
    appid?: string;
    setAppid: (state: string) => void;
    spoofWeather?: FakeWeatherKey;
    setSpoofWeather: (state: FakeWeatherKey | undefined) => void;
    isNight?: boolean;
    setIsNight: (state: boolean) => void;
    addAlert: (msg: string | unknown) => void;
}

type Form = {
    latlon: { value?: string; error?: string };
    zipcode: { value?: string; error?: string };
    apikey: { value?: string; error?: string };
    applicationKey: { value?: string; error?: string };
    apiKey: { value?: string; error?: string };
    weatherSource: { value?: WeatherSource; error?: string };
    appid: { value?: string; error?: string };
    spoofWeather: { value: FakeWeatherKey | 'actual'; error?: string };
    isNight: { value?: boolean; error?: string };
};

export default function Settings({
    settingsOpen,
    setSettingsOpen,
    latlon,
    setLatlon,
    zipcode,
    setZipcode,
    apikey,
    setApikey,
    applicationKey,
    setApplicationKey,
    apiKey,
    setApiKey,
    weatherSource,
    setWeatherSource,
    appid,
    setAppid,
    spoofWeather,
    setSpoofWeather,
    isNight,
    setIsNight,
    addAlert
}: Props) {
    const [form, setForm] = useState<Form>({
        latlon: {
            value: latlon && `${latlon.lat},${latlon.lon}`,
            error: undefined
        },
        zipcode: { value: zipcode, error: undefined },
        apikey: { value: apikey, error: undefined },
        applicationKey: { value: applicationKey, error: undefined },
        apiKey: { value: apiKey, error: undefined },
        weatherSource: { value: weatherSource, error: undefined },
        appid: { value: appid, error: undefined },
        spoofWeather: { value: spoofWeather || 'actual', error: undefined },
        isNight: { value: isNight, error: undefined }
    });
    const [locationLoading, setLocationLoading] = useState<boolean>(false);

    const getLocation = () => {
        if (navigator.geolocation) {
            setLocationLoading(true);
            const id = navigator.geolocation.watchPosition(
                (position) => {
                    setForm((form) => ({
                        ...form,
                        latlon: {
                            ...form.latlon,
                            value: `${position.coords.latitude},${position.coords.longitude}`
                        }
                    }));
                    clearTimeout(timeoutId);
                    setLocationLoading(false);
                    navigator.geolocation.clearWatch(id);
                },
                () => {
                    addAlert('failed to get location');
                    clearTimeout(timeoutId);
                    setLocationLoading(false);
                    navigator.geolocation.clearWatch(id);
                }
            );
            const timeoutId = setTimeout(() => {
                addAlert('failed to get location');
                setLocationLoading(false);
                navigator.geolocation.clearWatch(id);
            }, 15000);
        }
    };

    const parseLatLon = (latlon: string): LatLon => {
        const lat = parseFloat(latlon.split(',')[0]);
        const lon = parseFloat(latlon.split(',')[1]);
        if (Number.isNaN(lat) || Number.isNaN(lon)) {
            throw new Error('Invalid format for latitude and longitude');
        }
        return {
            lat,
            lon
        };
    };

    const validate = (): boolean => {
        let valid = true;

        setForm((prevForm) => {
            const tempForm: Form = { ...prevForm };
            Object.keys(prevForm).forEach((key) => {
                // @ts-ignore
                tempForm[key] = { ...prevForm[key], error: undefined };
            });

            if (!(tempForm.zipcode.value || tempForm.latlon.value)) {
                tempForm.zipcode.error =
                    'Zipcode or Latitude and Longitude required';
                tempForm.latlon.error =
                    'Latitude and Longitude or Zipcode required';
            }

            if (tempForm.latlon.value) {
                try {
                    parseLatLon(tempForm.latlon.value);
                } catch (e) {
                    tempForm.latlon.error =
                        'Invalid format, must be: (lat),(lon)';
                }
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
            setLatlon(
                form.latlon.value ? parseLatLon(form.latlon.value) : undefined
            );
            setZipcode(form.zipcode.value || '');
            setApikey(form.apikey.value || '');
            setApiKey(form.apiKey.value || '');
            setApplicationKey(form.applicationKey.value || '');
            setWeatherSource(form.weatherSource.value || 'OpenMeteo');
            setAppid(form.appid.value || '');
            setSpoofWeather(
                form.spoofWeather.value === 'actual'
                    ? undefined
                    : form.spoofWeather.value
            );
            setIsNight(!!form.isNight.value);
            setSettingsOpen(false);
        }
    };

    useEffect(() => {
        setForm((prevState) => ({
            ...prevState,
            latlon: {
                ...form.latlon,
                value: latlon && `${latlon.lat},${latlon.lon}`
            }
        }));
    }, [latlon]);

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
            apiKey: { ...form.apiKey, value: apiKey }
        }));
    }, [apiKey]);

    useEffect(() => {
        setForm((prevState) => ({
            ...prevState,
            applicationKey: { ...form.applicationKey, value: applicationKey }
        }));
    }, [applicationKey]);
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
    useEffect(() => {
        setForm((prevState) => ({
            ...prevState,
            isNight: { ...form.isNight, value: isNight }
        }));
    }, [isNight]);

    return (
        <Fragment>
            <SettingsWrapper onClick={() => setSettingsOpen(true)} />
            <Dialog
                dismiss={{ enabled: false }}
                open={settingsOpen}
                handler={() => setSettingsOpen(!settingsOpen)}
                className={'p-4 overflow-y-scroll'}
                style={{ maxHeight: '90vh' }}
            >
                <DialogHeader>Settings</DialogHeader>
                <DialogBody>
                    <div className="flex flex-row gap-4">
                        <div className="flex flex-col gap-6">
                            <div className="w-72">
                                <InputWrapper error={form.latlon.error}>
                                    <div className="relative flex w-full max-w-[24rem]">
                                        <Input
                                            label="Latitude and Longitute"
                                            crossOrigin={undefined}
                                            value={form.latlon.value}
                                            error={!!form.latlon.error}
                                            onChange={({ target }) =>
                                                setForm((form) => ({
                                                    ...form,
                                                    latlon: {
                                                        ...form.latlon,
                                                        value: target.value
                                                    }
                                                }))
                                            }
                                            containerProps={{
                                                className: 'min-w-0'
                                            }}
                                        />
                                        <Button
                                            size="sm"
                                            className="!absolute right-1 top-1 rounded"
                                            onClick={() => getLocation()}
                                            disabled={locationLoading}
                                        >
                                            {locationLoading ? (
                                                <Spinner className="h-4 w-4" />
                                            ) : (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                    className="w-4 h-4"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                                                    />
                                                </svg>
                                            )}
                                        </Button>
                                    </div>
                                </InputWrapper>
                            </div>
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
                                <InputWrapper error={form.apiKey.error}>
                                    <Input
                                        label="AWN API Key"
                                        crossOrigin={undefined}
                                        value={form.apiKey.value}
                                        error={!!form.apiKey.error}
                                        onChange={({ target }) =>
                                            setForm((form) => ({
                                                ...form,
                                                apiKey: {
                                                    ...form.apiKey,
                                                    value: target.value
                                                }
                                            }))
                                        }
                                    />
                                </InputWrapper>
                            </div>
                            <div className="w-72">
                                <InputWrapper error={form.applicationKey.error}>
                                    <Input
                                        label="AWN Application Key"
                                        crossOrigin={undefined}
                                        value={form.applicationKey.value}
                                        error={!!form.applicationKey.error}
                                        onChange={({ target }) =>
                                            setForm((form) => ({
                                                ...form,
                                                applicationKey: {
                                                    ...form.applicationKey,
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
                            {form.spoofWeather.value !== 'actual' && (
                                <InputWrapper error={form.spoofWeather.error}>
                                    <div style={{ marginTop: 20 }}>
                                        <Checkbox
                                            crossOrigin={undefined}
                                            label="Is Night"
                                            checked={form.isNight.value}
                                            onChange={() => {
                                                setForm((form) => ({
                                                    ...form,
                                                    isNight: {
                                                        ...form.isNight,
                                                        value: !form.isNight
                                                            .value
                                                    }
                                                }));
                                            }}
                                        />
                                    </div>
                                </InputWrapper>
                            )}
                        </div>
                        {/*<div className="flex flex-col gap-6"></div>*/}
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
