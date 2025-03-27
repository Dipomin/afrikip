import { NextPage, GetServerSidePropsContext, GetServerSideProps } from "next";

interface ErrorProps {
  statusCode: number;
}

const ErrorPage: NextPage<ErrorProps> = ({ statusCode }) => {
  return (
    <div>
      <h1>
        {statusCode
          ? `An error ${statusCode} occurred on server`
          : "An error occurred on client"}
      </h1>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { query, res } = context;
  const err = query.err as string;

  const statusCode = res ? res.statusCode : err ? parseInt(err, 10) : 404;

  return { props: { statusCode } };
};

export default ErrorPage;
