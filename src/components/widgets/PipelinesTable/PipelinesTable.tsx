import React from 'react';
import { Table, TableColumn, Progress } from '@backstage/core-components';
import Alert from '@material-ui/lab/Alert';
import { useAsync } from 'react-use';
import { gitlabAppData } from '../../gitlabAppData';
import { GitlabCIApiRef } from '../../../api';
import { useApi } from '@backstage/core-plugin-api';
import { createStatusColumn } from './columns';
import { PipelineObject } from '../../types';

export const DenseTable = ({ pipelineObjects }: any) => {

  const columns: TableColumn[] = [
    { title: 'Pipeline_ID', field: 'id' },
    createStatusColumn(),
    { title: 'Branch', field: 'ref' },
    { title: 'Web URL', field: 'web_url' },
];
  const title = "Gitlab Pipelines: " + pipelineObjects?.project_name;

  const data = pipelineObjects.data.map((pipelineObject: PipelineObject) => {
    return {
       id: pipelineObject.id,
       status: pipelineObject.status,
       ref: pipelineObject.ref,
       web_url: pipelineObject.web_url,
    };
  });

  return (
    <Table
      title={title}
      options={{ search: true, paging: true }}
      columns={columns}
      data={data}   
    />
  );
};

  export const PipelinesTable = ({}) => {
  const { project_id } = gitlabAppData();

  const GitlabCIAPI = useApi(GitlabCIApiRef);

  const { value, loading, error } = useAsync(async (): Promise<PipelineObject[]> => {
  const gitlabObj = await GitlabCIAPI.getPipelineSummary(project_id);
  const data = gitlabObj?.getPipelinesData;
  let renderData: any = { data }

  renderData.project_name = await GitlabCIAPI.getProjectName(project_id);
  return renderData;
}, []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return <DenseTable pipelineObjects={value || []} />;
};