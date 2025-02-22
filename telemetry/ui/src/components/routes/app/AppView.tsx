import { Navigate, useParams } from 'react-router';
import { DefaultService, Step } from '../../../api';
import { useQuery } from 'react-query';
import { Loading } from '../../common/loading';
import { StepList } from './StepList';
import TwoColumnLayout from '../../common/layout';
import { AppStateView } from './StateMachine';
import { useEffect, useState } from 'react';
import { Status } from '../../../utils';

/**
 * Gives a list of prior actions. Note they're currently sorted in order from
 * most recent to least recent. We should probably switch that.
 */
const getPriorActions = (currentActionIndex: number, steps: Step[], numPrevious: number) => {
  return steps.slice(currentActionIndex, currentActionIndex + numPrevious);
};

const REFRESH_INTERVAL = 500;

/**
 * Some tailwind mappings for bg colors -- we get progressively lighter the further back in
 * time we go
 * @param index Index away from the current step
 * @param status Status of the step at that index
 * @returns A tailwind class for the background color
 */
export const backgroundColorsForIndex = (index: number, status: Status) => {
  const colorsByStatus = {
    success: [
      'bg-green-500/80',
      'bg-green-500/70',
      'bg-green-500/60',
      'bg-green-500/50',
      'bg-green-500/30',
      'bg-green-500/10',
      'bg-green-500/5'
    ],
    failure: [
      'bg-dwred/80',
      'bg-dwred/70',
      'bg-dwred/60',
      'bg-dwred/50',
      'bg-dwred/30',
      'bg-dwred/10',
      'bg-dwred/5'
    ],
    // We likely will not need the prior running colors but :shrug: best to keep it consistent
    running: [
      'bg-dwlightblue/80',
      'bg-dwlightblue/70',
      'bg-dwlightblue/60',
      'bg-dwlightblue/50',
      'bg-dwlightblue/30',
      'bg-dwlightblue/10',
      'bg-dwlightblue/5'
    ]
  };
  const colors = colorsByStatus[status];
  if (index < colors.length) {
    return colors[index];
  }
  return colors[colors.length - 1];
};

// Default number of previous actions to show
const NUM_PREVIOUS_ACTIONS = 6;

/**
 * View for the "Application" page. This has two columns:
 * 1. A list of steps
 * 2. A view of the state machine/data/action
 */
export const AppView = () => {
  const { projectId, appId } = useParams();
  const [currentActionIndex, setCurrentActionIndex] = useState<number | undefined>(undefined);
  const [hoverIndex, setCurrentHoverIndex] = useState<number | undefined>(undefined);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const shouldQuery = projectId !== undefined && appId !== undefined;
  const { data, error } = useQuery(
    ['apps', projectId],
    () =>
      DefaultService.getApplicationLogsApiV0ProjectIdAppIdAppsGet(
        projectId as string,
        appId as string
      ),
    {
      refetchInterval: autoRefresh ? REFRESH_INTERVAL : false,
      enabled: shouldQuery
    }
  );

  useEffect(() => {
    const steps = data?.steps || [];
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          setCurrentActionIndex((prevIndex) => {
            if (prevIndex === undefined || prevIndex <= 0) {
              return 0;
            } else {
              return prevIndex - 1;
            }
          });
          break;
        case 'ArrowDown':
          setCurrentActionIndex((prevIndex) => {
            if (prevIndex === undefined) {
              return 0;
            } else if (prevIndex >= steps.length - 1) {
              return prevIndex;
            } else {
              return prevIndex + 1;
            }
          });
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [data?.steps]);
  if (!shouldQuery) {
    return <Navigate to={'/projects'} />;
  }

  if (error) return <div>Error loading steps</div>;
  if (data === undefined) return <Loading />;

  const previousActions =
    currentActionIndex !== undefined
      ? getPriorActions(currentActionIndex, data.steps, NUM_PREVIOUS_ACTIONS)
      : currentActionIndex;
  const stepsCopied = [...data.steps];
  const stepsSorted = stepsCopied.sort((a, b) => {
    // Parse dates to get time in milliseconds
    const timeA = new Date(a.step_start_log.start_time).getTime();
    const timeB = new Date(b.step_start_log.start_time).getTime();

    // If times are equal down to milliseconds, compare microseconds
    if (timeA === timeB) {
      const microA = parseInt(a.step_start_log.start_time.slice(-6));
      const microB = parseInt(b.step_start_log.start_time.slice(-6));

      // Compare microseconds
      return microB - microA;
    }

    // Otherwise, compare milliseconds
    return timeB - timeA;
  });
  return (
    <TwoColumnLayout
      leftColumnContent={
        <StepList
          steps={stepsSorted}
          currentHoverIndex={hoverIndex}
          setCurrentHoverIndex={setCurrentHoverIndex}
          currentSelectedIndex={currentActionIndex}
          setCurrentSelectedIndex={setCurrentActionIndex}
          numPriorIndices={NUM_PREVIOUS_ACTIONS}
          autoRefresh={autoRefresh}
          setAutoRefresh={setAutoRefresh}
        />
      }
      rightColumnContent={
        <AppStateView
          steps={stepsSorted}
          stateMachine={data.application}
          highlightedActions={previousActions}
          hoverAction={hoverIndex ? stepsSorted[hoverIndex] : undefined}
          currentActionIndex={currentActionIndex}
        />
      }
    />
  );
};
