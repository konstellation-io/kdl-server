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
  { skipFirstRun = true, debounceTime = 2000, minWordsNumber = 50 } = {}
) {
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
    if (!skipFirstRun) getQualityProjectDesc({ variables: { description } });
    // We want to run this only on first.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    const scoreTimeoutId = setTimeout(
      () => getQualityProjectDesc({ variables: { description } }),
      debounceTime
    );

    return () => clearTimeout(scoreTimeoutId);
  }, [description]);

  return {
    descriptionScore,
    getQualityProjectDesc,
  };
}

export default useQualityDescription;
