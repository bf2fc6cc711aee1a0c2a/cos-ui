const { exec } = require('child_process');

const fetcher = GraphiQL.createFetcher({
  url: process.env.GRAPHQL,
  headers: {
    Authorization: `Bearer ${process.env.TOKEN}`,
  },
});

ReactDOM.render(
  React.createElement(GraphiQL, { fetcher: fetcher }),
  document.getElementById('graphiql')
);
