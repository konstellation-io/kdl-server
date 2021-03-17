import { useEffect, useRef, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import {
  GetQualityProjectDesc,
  GetQualityProjectDescVariables,
} from 'Graphql/queries/types/GetQualityProjectDesc';
import { loader } from 'graphql.macro';

const GetQualityProjectDescQuery = loader(
  'Graphql/queries/getQualityProjectDesc.graphql'
);

function useQualityDescription(
  description: string,
  { skipFirstRun = true, debounceTime = 2000, minWordsNumber = 2000 } = {}
) {
  console.log(skipFirstRun);
  const firstRun = useRef(true);
  const [descriptionScore, setDescriptionScore] = useState(0);

  const [getQualityProjectDesc, { data: score }] = useLazyQuery<
    GetQualityProjectDesc,
    GetQualityProjectDescVariables
  >(GetQualityProjectDescQuery);

  useEffect(() => {
    if (score !== undefined)
      setDescriptionScore(score.qualityProjectDesc.quality || 0);
  }, [score]);

  useEffect(() => {
    if (skipFirstRun && firstRun.current) {
      firstRun.current = false;
      return;
    }

    const scoreTimeoutId = setTimeout(() => {
      console.log('sending to back');
      getQualityProjectDesc({ variables: { description } });
    }, debounceTime);

    return () => clearTimeout(scoreTimeoutId);
  }, [description]);

  return {
    descriptionScore,
    getQualityProjectDesc,
  };
}

export default useQualityDescription;
