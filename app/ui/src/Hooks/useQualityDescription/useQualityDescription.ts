import {
  GetQualityProjectDesc,
  GetQualityProjectDescVariables,
} from 'Graphql/queries/types/GetQualityProjectDesc';
import { useEffect, useRef, useState } from 'react';

import { useLazyQuery } from '@apollo/client';

import GetQualityProjectDescQuery from 'Graphql/queries/getQualityProjectDesc';

type Options = {
  skipFirstRun?: boolean;
  debounceTime?: number;
  minWordsNumber?: number;
};

function useQualityDescription(
  description: string,
  {
    skipFirstRun = true,
    debounceTime = 1000,
    minWordsNumber = 50,
  }: Options = {}
) {
  const [descriptionScore, setDescriptionScore] = useState(0);
  const [loading, setLoading] = useState(false);

  const [getQualityProjectDesc, { error }] = useLazyQuery<
    GetQualityProjectDesc,
    GetQualityProjectDescVariables
  >(GetQualityProjectDescQuery, {
    onCompleted: (data) => {
      setDescriptionScore(data.qualityProjectDesc.quality || 0);
      setLoading(false);
    },
  });

  const isLengthAcceptable = description.split(' ').length >= minWordsNumber;

  function fetchDescriptionScore() {
    getQualityProjectDesc({ variables: { description } });
  }

  useEffect(() => {
    if (!skipFirstRun) fetchDescriptionScore();
    // We want to run this only on hook instantiation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const firstRun = useRef(true);
  useEffect(() => {
    let scoreTimeoutId: number = 0;

    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    if (isLengthAcceptable) {
      setLoading(true);
      scoreTimeoutId = window.setTimeout(fetchDescriptionScore, debounceTime);
    } else {
      setDescriptionScore(0);
    }

    return () => clearTimeout(scoreTimeoutId);
    // We can omit fetchDescriptionScore as it is not change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [description, debounceTime]);

  return {
    loading,
    error,
    descriptionScore,
    fetchDescriptionScore,
  };
}

export default useQualityDescription;
