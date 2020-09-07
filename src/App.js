import React from 'react';
import './App.css';
import Game from './Components/Game'
import { useQuery } from '@apollo/react-hooks';
import gql from "graphql-tag";
const GET_INFO =  gql`
  query topAnimals($skip: Int, $limit: Int)  {
    topAnimals(skip: $skip, limit: $limit){
      name,
      artwork{url}
    }
  }
`;

function App() {
  const { data, loading, error } = useQuery(GET_INFO, {
    skip: 0,
    limit: 5
  });
  console.log(data)

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error</p>;
  return (
    <React.Fragment>
      <div>
        <div className="header">
        </div>
        <div className="gameContainer"  style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '100vh'}}>
          <Game topAnimals = {data.topAnimals} />
        </div>
      </div>
    </React.Fragment>
  );
}

export default App;
