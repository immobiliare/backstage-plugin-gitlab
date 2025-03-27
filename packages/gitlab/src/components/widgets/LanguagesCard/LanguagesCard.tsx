import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import {
    InfoCard,
    InfoCardVariants,
    Progress,
} from '@backstage/core-components';
import { GitlabCIApiRef } from '../../../api';
import { useApi } from '@backstage/core-plugin-api';
import { useAsync } from 'react-use';
import {
    gitlabInstance,
    gitlabProjectId,
    gitlabProjectSlug,
} from '../../gitlabAppData';
import { Chip, Tooltip } from '@material-ui/core';
import { colors } from './colors';
import { Languages } from '../../types';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import { gitlabTranslationRef } from '../../../translation';

const useStyles = makeStyles((theme) => ({
    infoCard: {
        marginBottom: theme.spacing(3),
        '& + .MuiAlert-root': {
            marginTop: theme.spacing(3),
        },
    },
    barContainer: {
        height: theme.spacing(2),
        marginBottom: theme.spacing(3),
        borderRadius: '4px',
        backgroundColor: 'transparent',
        overflow: 'hidden',
    },
    bar: {
        height: '100%',
        position: 'relative',
    },
    languageDot: {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        marginRight: theme.spacing(1),
        display: 'inline-block',
    },
    label: {
        color: 'inherit',
    },
}));

type Props = {
    variant?: InfoCardVariants;
};

export const LanguagesCard = (props: Props) => {
    const classes = useStyles();
    let barWidth = 0;
    let languageTitle = new String();
    const project_id = gitlabProjectId();
    const project_slug = gitlabProjectSlug();
    const gitlab_instance = gitlabInstance();
    const { t } = useTranslationRef(gitlabTranslationRef);

    const GitlabCIAPI = useApi(GitlabCIApiRef).build(
        gitlab_instance || 'gitlab.com'
    );

    const { value, loading, error } = useAsync(async (): Promise<Languages> => {
        const projectDetails = await GitlabCIAPI.getProjectDetails(
            project_slug || project_id
        );

        if (!projectDetails)
            throw new Error('wrong project_slug or project_id');

        const summary = await GitlabCIAPI.getLanguagesSummary(
            projectDetails.id
        );
        if (!summary) throw new Error('Languages summary is not defined!');

        return summary;
    });

    if (loading) {
        return <Progress />;
    } else if (error) {
        return (
            <Alert severity="error" className={classes.infoCard}>
                {error.message}
            </Alert>
        );
    }

    return value ? (
        <InfoCard title={t('languagesCard.title')} variant={props.variant}>
            <div className={classes.barContainer}>
                {Object.entries(value).map((language, index: number) => {
                    barWidth = barWidth + language[1];
                    languageTitle = language[0] + ' ' + language[1] + '%';
                    return (
                        <Tooltip
                            title={languageTitle}
                            placement="bottom-end"
                            key={language[0]}
                        >
                            <div
                                className={classes.bar}
                                key={language[0]}
                                style={{
                                    marginTop: index === 0 ? '0' : `-16px`,
                                    zIndex: Object.keys(value).length - index,
                                    backgroundColor:
                                        colors[language[0]]?.color || '#333',
                                    width: `${barWidth}%`,
                                }}
                            />
                        </Tooltip>
                    );
                })}
            </div>
            {Object.entries(value).map((language) => (
                <Chip
                    classes={{
                        label: classes.label,
                    }}
                    label={
                        <>
                            <span
                                className={classes.languageDot}
                                style={{
                                    backgroundColor:
                                        colors[language[0]]?.color || '#333',
                                }}
                            />
                            <b>{language[0]}</b> - {language[1]}%
                        </>
                    }
                    variant="outlined"
                    key={language[0]}
                />
            ))}
        </InfoCard>
    ) : (
        <InfoCard title={t('languagesCard.title')} variant={props.variant} />
    );
};
