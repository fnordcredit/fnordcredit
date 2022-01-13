import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { createSwaggerSpec } from 'next-swagger-doc';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

const ApiDoc = ({ spec }: InferGetStaticPropsType<typeof getStaticProps>) => {
  return <>
    <style global jsx>{`
      html, body {
        background-color: #fff !important
      }
    `}</style>
    <SwaggerUI spec={spec} />
  </>;
};

export const getStaticProps: GetStaticProps = async ctx => {
  const spec: Record<string, any> = createSwaggerSpec({
    title: 'Fnordcredit API',
    version: 'v1',
  });
  return {
    props: {
      spec,
    },
  };
};

export default ApiDoc;
