import { useEffect, useMemo, useRef, useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import {
  GetQualityProjectDesc,
  GetQualityProjectDescVariables,
} from 'Graphql/queries/types/GetQualityProjectDesc';
import { loader } from 'graphql.macro';

const GetQualityProjectDescQuery = loader(
  'Graphql/queries/getQualityProjectDesc.graphql'
);

type Options = {
  skipFirstRun?: boolean;
  debounceTime?: number;
  minWordsNumber?: number;
};

function useQualityDescription(
  description: string,
  {
    skipFirstRun = true,
    debounceTime = 2000,
    minWordsNumber = 50,
  }: Options = {}
) {
  const [descriptionScore, setDescriptionScore] = useState(0);

  const [getQualityProjectDesc] = useLazyQuery<
    GetQualityProjectDesc,
    GetQualityProjectDescVariables
  >(GetQualityProjectDescQuery, {
    onCompleted: (data) => {
      setDescriptionScore(data.qualityProjectDesc.quality || 0);
    },
  });

  const isDescriptionLengthValid = useMemo(() => {
    const isValid = description.split(' ').length >= minWordsNumber;
    if (!isValid) setDescriptionScore(0);

    return isValid;
  }, [description, minWordsNumber]);

  useEffect(() => {
    if (!skipFirstRun && isDescriptionLengthValid)
      getQualityProjectDesc({ variables: { description } });
    // We want to run this only on first hook instantiation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (!isDescriptionLengthValid) return;

    const scoreTimeoutId = setTimeout(() => {
      getQualityProjectDesc({ variables: { description } });
    }, debounceTime);

    return () => clearTimeout(scoreTimeoutId);
  }, [description, isDescriptionLengthValid, getQualityProjectDesc]);

  return {
    descriptionScore,
    getQualityProjectDesc,
  };
}

export default useQualityDescription;
