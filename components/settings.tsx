// @ts-nocheck
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
import {
    DayPlaybackSpeed,
    FakeWeatherKey,
    LatLon,
    Sun2Pair,
    WeatherSource
} from '@/types';
import { fakeWeather } from '@/constants/data';
import InputWrapper from '@/components/inputwrapper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faStop } from '@fortawesome/free-solid-svg-icons';

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
    geoapifyApiKey?: string;
    setGeoapifyApiKey: (state: string) => void;
    awnApplicationKey?: string;
    setAwnApplicationKey: (state: string) => void;
    awnApiKey?: string;
    setAwnApiKey: (state: string) => void;
    weatherSource?: WeatherSource;
    setWeatherSource: (state: WeatherSource) => void;
    openWeatherMapAppId?: string;
    setOpenWeatherMapAppId: (state: string) => void;
    sun2Pairs: Sun2Pair[];
    sun2Prefix?: string;
    setSun2Prefix: (state: string | undefined) => void;
    spoofWeather?: FakeWeatherKey;
    setSpoofWeather: (state: FakeWeatherKey | undefined) => void;
    isNight?: boolean;
    setIsNight: (state: boolean) => void;
    fakeTime?: string;
    setFakeTime: (state: string | undefined) => void;
    playingDay: boolean;
    playbackSpeed: DayPlaybackSpeed;
    setPlaybackSpeed: (speed: DayPlaybackSpeed) => void;
    startDayPlayback: (startTime?: string) => void;
    stopDayPlayback: () => void;
    resetPreview: () => void;
    mono?: boolean;
    setMono: (state: boolean) => void;
    addAlert: (msg: string | unknown) => void;
}

type Form = {
    latlon: { value?: string; error?: string };
    zipcode: { value?: string; error?: string };
    geoapifyApiKey: { value?: string; error?: string };
    awnApplicationKey: { value?: string; error?: string };
    awnApiKey: { value?: string; error?: string };
    weatherSource: { value?: WeatherSource; error?: string };
    openWeatherMapAppId: { value?: string; error?: string };
    sun2Prefix: { value?: string; error?: string };
    spoofWeather: { value: FakeWeatherKey | 'actual'; error?: string };
    isNight: { value?: boolean; error?: string };
    fakeTime: { value?: string; error?: string };
    mono: { value: boolean; error?: string };
};

export default function Settings({
    settingsOpen,
    setSettingsOpen,
    latlon,
    setLatlon,
    zipcode,
    setZipcode,
    geoapifyApiKey,
    setGeoapifyApiKey,
    awnApplicationKey,
    setAwnApplicationKey,
    awnApiKey,
    setAwnApiKey,
    weatherSource,
    setWeatherSource,
    openWeatherMapAppId,
    setOpenWeatherMapAppId,
    sun2Pairs,
    sun2Prefix,
    setSun2Prefix,
    spoofWeather,
    setSpoofWeather,
    isNight,
    setIsNight,
    fakeTime,
    setFakeTime,
    playingDay,
    playbackSpeed,
    setPlaybackSpeed,
    startDayPlayback,
    stopDayPlayback,
    resetPreview,
    mono,
    setMono,
    addAlert
}: Props) {
    const [form, setForm] = useState<Form>({
        latlon: {
            value: latlon && `${latlon.lat},${latlon.lon}`,
            error: undefined
        },
        zipcode: { value: zipcode, error: undefined },
        geoapifyApiKey: { value: geoapifyApiKey, error: undefined },
        awnApplicationKey: { value: awnApplicationKey, error: undefined },
        awnApiKey: { value: awnApiKey, error: undefined },
        weatherSource: { value: weatherSource, error: undefined },
        openWeatherMapAppId: { value: openWeatherMapAppId, error: undefined },
        sun2Prefix: { value: sun2Prefix, error: undefined },
        spoofWeather: { value: spoofWeather || 'actual', error: undefined },
        isNight: { value: isNight, error: undefined },
        fakeTime: { value: fakeTime, error: undefined },
        mono: { value: !!mono, error: undefined }
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

            if (!tempForm.geoapifyApiKey.value) {
                tempForm.geoapifyApiKey.error = 'Geoapify API Key required';
            }

            if (tempForm.weatherSource.value === 'OpenWeatherMap') {
                if (!tempForm.openWeatherMapAppId.value) {
                    tempForm.openWeatherMapAppId.error =
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
            stopDayPlayback();
            setLatlon(
                form.latlon.value ? parseLatLon(form.latlon.value) : undefined
            );
            setZipcode(form.zipcode.value || '');
            setGeoapifyApiKey(form.geoapifyApiKey.value || '');
            setAwnApiKey(form.awnApiKey.value || '');
            setAwnApplicationKey(form.awnApplicationKey.value || '');
            setWeatherSource(form.weatherSource.value || 'OpenMeteo');
            setOpenWeatherMapAppId(form.openWeatherMapAppId.value || '');
            setSun2Prefix(form.sun2Prefix.value || undefined);
            setSpoofWeather(
                form.spoofWeather.value === 'actual'
                    ? undefined
                    : form.spoofWeather.value
            );
            setIsNight(!!form.isNight.value);
            setFakeTime(form.fakeTime.value || undefined);
            setMono(!!form.mono.value);
            setSettingsOpen(false);
        }
    };

    const onToggleDayPlayback = () => {
        if (playingDay) {
            stopDayPlayback();
        } else {
            startDayPlayback(form.fakeTime.value);
            setSettingsOpen(false);
        }
    };

    const onResetToLive = () => {
        setForm((form) => ({
            ...form,
            fakeTime: { ...form.fakeTime, value: undefined },
            spoofWeather: { ...form.spoofWeather, value: 'actual' }
        }));
        resetPreview();
        setSettingsOpen(false);
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
            geoapifyApiKey: { ...form.geoapifyApiKey, value: geoapifyApiKey }
        }));
    }, [geoapifyApiKey]);
    useEffect(() => {
        setForm((prevState) => ({
            ...prevState,
            awnApiKey: { ...form.awnApiKey, value: awnApiKey }
        }));
    }, [awnApiKey]);

    useEffect(() => {
        setForm((prevState) => ({
            ...prevState,
            awnApplicationKey: {
                ...form.awnApplicationKey,
                value: awnApplicationKey
            }
        }));
    }, [awnApplicationKey]);
    useEffect(() => {
        setForm((prevState) => ({
            ...prevState,
            weatherSource: { ...form.weatherSource, value: weatherSource }
        }));
    }, [weatherSource]);
    useEffect(() => {
        setForm((prevState) => ({
            ...prevState,
            openWeatherMapAppId: {
                ...form.openWeatherMapAppId,
                value: openWeatherMapAppId
            }
        }));
    }, [openWeatherMapAppId]);
    useEffect(() => {
        setForm((prevState) => ({
            ...prevState,
            sun2Prefix: { ...prevState.sun2Prefix, value: sun2Prefix }
        }));
    }, [sun2Prefix]);
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
    useEffect(() => {
        setForm((prevState) => ({
            ...prevState,
            fakeTime: { ...prevState.fakeTime, value: fakeTime }
        }));
    }, [fakeTime]);
    useEffect(() => {
        setForm((prevState) => ({
            ...prevState,
            mono: { ...form.mono, value: !!mono }
        }));
    }, [mono]);

    useEffect(() => {
        if (!settingsOpen) return;
        let cancelled = false;
        const apply = () => {
            if (cancelled) return;
            const dialog =
                document.querySelector<HTMLElement>('[role="dialog"]');
            if (dialog) {
                if (dialog.style.opacity !== '1') dialog.style.opacity = '1';
                if (dialog.style.transform !== 'none')
                    dialog.style.transform = 'none';
            }
            requestAnimationFrame(apply);
        };
        requestAnimationFrame(apply);
        return () => {
            cancelled = true;
        };
    }, [settingsOpen]);

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
                    <div className="flex flex-col gap-4 md:flex-row">
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
                                <InputWrapper error={form.geoapifyApiKey.error}>
                                    <Input
                                        label="Geoapify API Key"
                                        crossOrigin={undefined}
                                        value={form.geoapifyApiKey.value}
                                        error={!!form.geoapifyApiKey.error}
                                        onChange={({ target }) =>
                                            setForm((form) => ({
                                                ...form,
                                                geoapifyApiKey: {
                                                    ...form.geoapifyApiKey,
                                                    value: target.value
                                                }
                                            }))
                                        }
                                    />
                                </InputWrapper>
                            </div>
                            <div className="w-72">
                                <InputWrapper error={form.awnApiKey.error}>
                                    <Input
                                        label="AWN API Key"
                                        crossOrigin={undefined}
                                        value={form.awnApiKey.value}
                                        error={!!form.awnApiKey.error}
                                        onChange={({ target }) =>
                                            setForm((form) => ({
                                                ...form,
                                                awnApiKey: {
                                                    ...form.awnApiKey,
                                                    value: target.value
                                                }
                                            }))
                                        }
                                    />
                                </InputWrapper>
                            </div>
                            <div className="w-72">
                                <InputWrapper
                                    error={form.awnApplicationKey.error}
                                >
                                    <Input
                                        label="AWN Application Key"
                                        crossOrigin={undefined}
                                        value={form.awnApplicationKey.value}
                                        error={!!form.awnApplicationKey.error}
                                        onChange={({ target }) =>
                                            setForm((form) => ({
                                                ...form,
                                                awnApplicationKey: {
                                                    ...form.awnApplicationKey,
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
                            {sun2Pairs.length > 1 && (
                                <div className="w-72">
                                    <InputWrapper error={form.sun2Prefix.error}>
                                        <Select
                                            label="Sun2 Source"
                                            value={form.sun2Prefix.value || ''}
                                            onChange={(val) =>
                                                setForm((form) => ({
                                                    ...form,
                                                    sun2Prefix: {
                                                        ...form.sun2Prefix,
                                                        value: val || undefined
                                                    }
                                                }))
                                            }
                                        >
                                            {sun2Pairs.map((p) => (
                                                <Option
                                                    key={p.prefix}
                                                    value={p.prefix}
                                                >
                                                    {p.friendlyName} (
                                                    {p.entities.rising})
                                                </Option>
                                            ))}
                                        </Select>
                                    </InputWrapper>
                                </div>
                            )}
                            <div className="w-72">
                                <InputWrapper error={form.mono.error}>
                                    <Select
                                        label="Color Mode"
                                        value={
                                            form.mono.value ? 'mono' : 'color'
                                        }
                                        onChange={(val) =>
                                            setForm((form) => ({
                                                ...form,
                                                mono: {
                                                    ...form.mono,
                                                    value: val === 'mono'
                                                }
                                            }))
                                        }
                                    >
                                        <Option value="color">Color</Option>
                                        <Option value="mono">Monochrome</Option>
                                    </Select>
                                </InputWrapper>
                            </div>
                            {form.weatherSource.value === 'OpenWeatherMap' && (
                                <div className="w-72">
                                    <InputWrapper
                                        error={form.openWeatherMapAppId.error}
                                    >
                                        <Input
                                            label="OWM App ID"
                                            crossOrigin={undefined}
                                            value={
                                                form.openWeatherMapAppId.value
                                            }
                                            onChange={({ target }) =>
                                                setForm((form) => ({
                                                    ...form,
                                                    openWeatherMapAppId: {
                                                        ...form.openWeatherMapAppId,
                                                        value: target.value
                                                    }
                                                }))
                                            }
                                        />
                                    </InputWrapper>
                                </div>
                            )}
                        </div>
                        <div className="flex w-72 flex-col gap-6">
                            <div className="w-72">
                                <InputWrapper error={form.fakeTime.error}>
                                    <Input
                                        type="time"
                                        label="Fake Time"
                                        crossOrigin={undefined}
                                        value={form.fakeTime.value || ''}
                                        onChange={({ target }) =>
                                            setForm((form) => ({
                                                ...form,
                                                fakeTime: {
                                                    ...form.fakeTime,
                                                    value:
                                                        target.value ||
                                                        undefined
                                                }
                                            }))
                                        }
                                    />
                                </InputWrapper>
                                <div className="mb-4">
                                    <Select
                                        label="Playback Speed"
                                        value={playbackSpeed}
                                        disabled={playingDay}
                                        onChange={(value) =>
                                            setPlaybackSpeed(
                                                (value ||
                                                    'medium') as DayPlaybackSpeed
                                            )
                                        }
                                    >
                                        <Option value="slow">
                                            Slow (2 minutes)
                                        </Option>
                                        <Option value="medium">
                                            Medium (60 seconds)
                                        </Option>
                                        <Option value="fast">
                                            Fast (30 seconds)
                                        </Option>
                                    </Select>
                                </div>
                                <Button
                                    variant="outlined"
                                    color="blue"
                                    onClick={onToggleDayPlayback}
                                    className="flex w-full items-center justify-center gap-2"
                                >
                                    <FontAwesomeIcon
                                        icon={playingDay ? faStop : faPlay}
                                    />
                                    <span>
                                        {playingDay ? 'Stop Day' : 'Play Day'}
                                    </span>
                                </Button>
                                <div className="pt-2 text-center text-xs text-blue-gray-500">
                                    {form.fakeTime.value || '02:00'} to 22:00 at
                                    the selected playback rate
                                </div>
                                <Button
                                    variant="text"
                                    color="blue"
                                    onClick={onResetToLive}
                                    className="mt-2 w-full"
                                >
                                    Reset to Live
                                </Button>
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
                            {form.spoofWeather.value !== 'actual' &&
                                !form.fakeTime.value && (
                                    <InputWrapper
                                        error={form.spoofWeather.error}
                                    >
                                        <div>
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
