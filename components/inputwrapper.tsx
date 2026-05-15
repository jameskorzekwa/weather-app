// @ts-nocheck
import { Children, cloneElement, Fragment, ReactElement } from 'react';
import { Typography } from '@material-tailwind/react';

interface Props {
    error?: string;
    children: ReactElement;
}

export default function InputWrapper({ error, children }: Props) {
    const renderChildren = () => {
        return Children.map(children, (child) => {
            if (typeof child.type === 'string') return child;
            return cloneElement(child, {
                error: !!error
            } as any);
        });
    };
    return (
        // eslint-disable-next-line react/jsx-no-undef
        <Fragment>
            {renderChildren()}
            <Typography
                variant="small"
                color={'red'}
                style={{ height: '10px', paddingLeft: '5px', fontSize: 11.5 }}
            >
                {error || ''}
            </Typography>
        </Fragment>
    );
}
