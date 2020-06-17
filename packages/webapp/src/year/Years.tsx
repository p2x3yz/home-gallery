import * as React from "react";
import { useMemo } from "react";

import {
  BrowserRouter as Router,
  useParams,
  Link
} from "react-router-dom";

import { NavBar } from '../navbar/NavBar';
import { List } from '../list/List';
import { useStoreActions } from '../store/hooks';
import { useStoreState } from "easy-peasy";

export const Years = () => {
  const allEntries = useStoreState(state => state.entries.allEntries);
  
  const years = useMemo(() => {
    const years = allEntries.reduce((result, {year}) => {
      if (result.indexOf(year) < 0) {
        result.push(year);
      }
      return result;
    }, [])
    years.sort((a,b) => b < a ? -1 : 1);
    return years;
  }, [allEntries]);

  return ( 
    <>
      <NavBar />
      <h2 style={{marginTop: '40px'}}>Years</h2>
      <ul>
        {years.map(year => {
          return <li key={year}>
            <Link to={`/years/${year}`}>{year}</Link>
          </li>
        })}
      </ul>
    </>
  )
}

export const YearView = () => {
  const params = useParams();
  const year = +params.year;
  const search = useStoreActions(actions => actions.entries.search);
  search({type: 'year', value: year, revert: false});

  return ( 
    <>
      <List />
    </>
  )
}