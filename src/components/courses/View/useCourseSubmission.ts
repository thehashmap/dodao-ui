import { useNotificationContext } from '@/contexts/NotificationContext';
import {
  CourseDetailsFragment,
  CourseSubmissionFragment,
  CourseTopicFragment,
  GitCourseTopicSubmissionInput,
  Space,
  TopicCorrectAnswersFragment,
  TopicSubmissionFragment,
  useGitCourseQueryQuery,
  useGitCourseSubmissionQuery,
  useInitializeGitCourseSubmissionMutation,
  useSubmitGitCourseMutation,
  useSubmitGitCourseTopicMutation,
  useUpsertGitCourseTopicSubmissionMutation,
} from '@/graphql/generated/generated-types';
import { useI18 } from '@/hooks/useI18';
import { GitCourseSubmissionModel } from '@/types/deprecated/models/course/GitCourseSubmissionModel';
import isEqual from 'lodash/isEqual';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

//... Other necessary imports from your original Vue code
export enum QuestionStatus {
  Skipped = 'Skipped',
  Completed = 'Completed',
  Uncompleted = 'Uncompleted',
}

export enum TopicItemStatus {
  Completed = 'Completed',
  Uncompleted = 'Uncompleted',
}

export enum TopicStatus {
  UnAttempted = 'UnAttempted',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Submitted = 'Submitted',
}

export type CourseQuestionSubmission = {
  uuid: string;
  status: QuestionStatus;
  answers: string[];
};

export type ReadingSubmission = {
  uuid: string;
  status: TopicItemStatus;
  questions?: Record<string, CourseQuestionSubmission>;
};

export type SummarySubmission = {
  key: string;
  status: TopicItemStatus;
};

export type ExplanationSubmission = {
  key: string;
  status: TopicItemStatus;
};

export interface TempTopicSubmission {
  uuid: string;
  topicKey: string;
  explanations: Record<string, ExplanationSubmission>;
  questions: Record<string, CourseQuestionSubmission>;
  readings: Record<string, ReadingSubmission>;
  summaries: Record<string, SummarySubmission>;
  correctAnswers?: Record<string, TopicCorrectAnswersFragment>;
  status: TopicStatus;
}

export interface TempCourseSubmission extends GitCourseSubmissionModel {
  topicSubmissionsMap: Record<string, TempTopicSubmission>;
}

function transformTopicSubmissionResponse(sub: TopicSubmissionFragment): TempTopicSubmission {
  const explanations = sub.submission?.explanations || [];
  const questions = sub.submission?.questions || [];
  const readings = sub.submission?.readings || [];
  const summaries = sub.submission?.summaries || [];

  const tempTopicSubmission: TempTopicSubmission = {
    topicKey: sub.topicKey,
    uuid: sub.uuid,
    explanations: Object.fromEntries(
      explanations.map((explanation) => [explanation.key, { key: explanation.key, status: explanation.status as TopicItemStatus }])
    ),
    questions: Object.fromEntries(
      questions.map((question) => [
        question.uuid,
        {
          uuid: question.uuid,
          status: question.status as QuestionStatus,
          answers: question.answers,
        },
      ])
    ),
    readings: Object.fromEntries(
      readings.map((reading) => {
        const readingsQuestions = reading.questions || [];
        return [
          reading.uuid,
          {
            uuid: reading.uuid,
            status: reading.status as TopicItemStatus,
            questions: Object.fromEntries(
              readingsQuestions.map((question) => [
                question.uuid,
                {
                  uuid: question.uuid,
                  status: question.status as QuestionStatus,
                  answers: question.answers,
                },
              ])
            ),
          },
        ];
      })
    ),
    summaries: Object.fromEntries(summaries.map((summary) => [summary.key, { key: summary.key, status: summary.status as TopicItemStatus }])),
    status: sub.status as TopicStatus,
    correctAnswers: sub.correctAnswers ? Object.fromEntries(sub.correctAnswers?.map((correct) => [correct.uuid, correct])) : undefined,
  };
  return tempTopicSubmission;
}

function transformCourseSubmissionResponse(courseSubmissionResponse: CourseSubmissionFragment, course: CourseDetailsFragment): TempCourseSubmission {
  const topicSubmissionsMap: Record<string, TopicSubmissionFragment> =
    Object.fromEntries(courseSubmissionResponse.topicSubmissions?.map((t) => [t.topicKey, t])) || {};
  const courseSubmission = {
    uuid: courseSubmissionResponse.uuid,
    courseKey: courseSubmissionResponse.courseKey,
    createdAt: courseSubmissionResponse.createdAt,
    createdBy: courseSubmissionResponse.createdBy,
    galaxyCredentialsUpdated: courseSubmissionResponse.galaxyCredentialsUpdated || undefined,
    isLatestSubmission: courseSubmissionResponse.isLatestSubmission || undefined,
    questionsAttempted: courseSubmissionResponse.questionsAttempted || undefined,
    questionsCorrect: courseSubmissionResponse.questionsCorrect || undefined,
    questionsIncorrect: courseSubmissionResponse.questionsIncorrect || undefined,
    questionsSkipped: courseSubmissionResponse.questionsSkipped || undefined,
    spaceId: courseSubmissionResponse.spaceId,
    status: courseSubmissionResponse.status,
    updatedAt: courseSubmissionResponse.updatedAt,
    topicSubmissionsMap: Object.fromEntries(
      course.topics.map((t) => {
        const topicSubmission: TempTopicSubmission = topicSubmissionsMap[t.key]?.submission
          ? transformTopicSubmissionResponse(topicSubmissionsMap[t.key])
          : {
              uuid: uuidv4(),
              topicKey: t.key,
              explanations: {},
              questions: {},
              readings: {},
              summaries: {},
              status: TopicStatus.UnAttempted,
            };

        return [topicSubmission.topicKey, topicSubmission];
      })
    ),
  };
  return courseSubmission;
}

export interface CourseSubmissionHelper {
  courseSubmission: TempCourseSubmission | undefined;
  loadedSubmission?: CourseSubmissionFragment | null;
  getTopic: (topicKey: string) => CourseTopicFragment;
  markReadingCompleted: Function;
  saveReadingAnswer: Function;
  markSummaryCompleted: Function;
  markExplanationCompleted: (chapterId: string, explanationKey: string) => Promise<void>;
  saveAnswer: Function;
  submitCourse: Function;
  submitCourseTopic: Function;
  upsertTopicSubmission: Function;
  isAllReadingsComplete: (topic: CourseTopicFragment) => boolean;
  isAllExplanationsComplete: (topic: CourseTopicFragment) => boolean;
  isAllSummariesComplete: (topic: CourseTopicFragment) => boolean;
  isAllEvaluationsComplete: (topic: CourseTopicFragment) => boolean;
  isTopicComplete: (topic: CourseTopicFragment) => boolean;
  isTopicSubmissionInSubmittedStatus: (topicKey: string) => boolean;
  correctAndWrongAnswerCounts: (topicKey: string) => { correctAnswers: number; wrongAnswers: number };
  getTopicSubmission: (topicKey: string) => TempTopicSubmission | undefined;
}

export const useCourseSubmission = (space: Space, courseKey: string): CourseSubmissionHelper => {
  const [courseSubmission, setCourseSubmission] = useState<TempCourseSubmission | undefined>();
  const { data: session } = useSession();

  const { data: courseResponse } = useGitCourseQueryQuery({ variables: { spaceId: space.id, courseKey: courseKey }, fetchPolicy: 'cache-only' });

  const { data: submissionResponse, loading: loadingSubmission } = useGitCourseSubmissionQuery({
    variables: { courseKey: courseKey, spaceId: space.id },
  });
  const { showNotification } = useNotificationContext();
  const { $t } = useI18();
  const [upsertGitCourseTopicSubmissionMutation] = useUpsertGitCourseTopicSubmissionMutation();
  const [submitGitCourseTopicMutation] = useSubmitGitCourseTopicMutation();
  const [submitGitCourseMutation] = useSubmitGitCourseMutation();
  const [initializeGitCourseSubmissionMutation] = useInitializeGitCourseSubmissionMutation();

  const initialize = async () => {
    const course = courseResponse?.course;
    if (!course) return;

    if (!submissionResponse || loadingSubmission) return;

    if (!session) return;

    if (courseSubmission || loadingSubmission) return;

    const loadedSubmission = submissionResponse?.payload;

    console.log('submissionResponse', submissionResponse);
    console.log('loadedSubmission', loadedSubmission);
    console.log('loadingCourseSubmission', loadingSubmission);
    if (loadedSubmission) {
      const submission = transformCourseSubmissionResponse(loadedSubmission!, course);
      setCourseSubmission(submission);
    } else {
      try {
        const initializationResponse = await initializeGitCourseSubmissionMutation({
          variables: { courseKey: courseKey, spaceId: space.id },
          updateQueries: {
            GitCourseSubmission: (prev, { mutationResult }) => {
              return mutationResult.data!;
            },
          },
        });
        const initialedSubmission = initializationResponse.data?.payload;
        const submission = transformCourseSubmissionResponse(initialedSubmission!, course);
        setCourseSubmission(submission);
      } catch {
        showNotification({ type: 'error', message: $t('courses.view.chapterSubmitError') });
      }
    }
  };
  useEffect(() => {
    initialize();
  }, [submissionResponse?.payload, courseResponse?.course, session]);

  const isAllReadingsComplete = (topic: CourseTopicFragment) => {
    if (!topic?.readings) return false;
    return topic.readings.every(
      (reading) => courseSubmission?.topicSubmissionsMap?.[topic.key]?.readings?.[reading.uuid]?.status === TopicItemStatus.Completed
    );
  };

  const isAllSummariesComplete = (topic: CourseTopicFragment) => {
    if (!topic?.summaries) return false;
    return topic.summaries.every(
      (summary) => courseSubmission?.topicSubmissionsMap?.[topic.key]?.summaries?.[summary.key]?.status === TopicItemStatus.Completed
    );
  };

  const isAllExplanationsComplete = (topic: CourseTopicFragment) => {
    if (!topic?.explanations?.length) return true;
    return topic.explanations.every(
      (explanation) => courseSubmission?.topicSubmissionsMap?.[topic.key].explanations?.[explanation.key]?.status === TopicItemStatus.Completed
    );
  };

  const isAllEvaluationsComplete = (topic: CourseTopicFragment) => {
    if (!topic?.questions) return false;
    return topic.questions.every((question) => {
      const questionRes: CourseQuestionSubmission | undefined = courseSubmission?.topicSubmissionsMap?.[topic.key]?.questions?.[question.uuid];
      return questionRes?.status === QuestionStatus.Completed && questionRes.answers.length > 0;
    });
  };

  const isTopicSubmissionInSubmittedStatus = (topicKey: string) => {
    const topicSubmission = courseSubmission?.topicSubmissionsMap[topicKey];
    return topicSubmission?.status === TopicStatus.Submitted;
  };

  function getTopic(topicKey: string): CourseTopicFragment {
    const topicInfo: CourseTopicFragment | undefined = courseResponse?.course?.topics.find((topic) => topicKey === topic.key);

    if (!topicInfo) throw new Error('No topic found with key :' + topicKey);
    return topicInfo;
  }

  function courseAndTopicSubmission(topicKey: string): {
    courseSub: TempCourseSubmission;
    topicSub: TempTopicSubmission;
  } {
    if (!courseSubmission) throw new Error('No course submission found');
    const topicSubmission = courseSubmission?.topicSubmissionsMap[topicKey];
    if (!topicSubmission) throw new Error('No course submission found');

    return {
      courseSub: courseSubmission,
      topicSub: topicSubmission,
    };
  }

  function getTopicSubmission(topicKey: string): TempTopicSubmission | undefined {
    return courseSubmission?.topicSubmissionsMap[topicKey];
  }

  function getTopicSubmissionInput(courseKey: string, tempTopicSubmission: TempTopicSubmission) {
    const topic = getTopic(tempTopicSubmission.topicKey);

    const topicSubmission = tempTopicSubmission;
    if (!topicSubmission) {
      console.error('No topic submission', courseSubmission?.topicSubmissionsMap);
      showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
      return;
    }

    const readingComplete = isAllReadingsComplete(topic);
    const summaryComplete = isAllSummariesComplete(topic);
    const explanationComplete = isAllExplanationsComplete(topic);
    const evaluationComplete = isAllEvaluationsComplete(topic);

    const status =
      topicSubmission.status === TopicStatus.Submitted
        ? TopicStatus.Submitted
        : readingComplete && summaryComplete && evaluationComplete && explanationComplete
        ? TopicStatus.Completed
        : TopicStatus.InProgress;

    const request: GitCourseTopicSubmissionInput = {
      uuid: topicSubmission.uuid,
      courseKey,
      topicKey: topicSubmission.topicKey,
      summaries: Object.values(topicSubmission?.summaries || {}) || [],
      explanations: Object.values(topicSubmission?.explanations || {}) || [],
      questions: Object.values(topicSubmission?.questions || {}) || [],
      readings:
        Object.values(topicSubmission?.readings || {}).map((reading) => ({
          ...reading,
          questions: reading.questions ? Object.values(reading.questions) : [],
        })) || [],
      status,
    };
    return request;
  }

  const upsertTopicSubmission = async (courseKey: string, tempTopicSubmission: TempTopicSubmission) => {
    const request = getTopicSubmissionInput(courseKey, tempTopicSubmission);
    if (!request) {
      console.error('No topic submission request');
      showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
      return;
    }

    try {
      const topicSubmission = await upsertGitCourseTopicSubmissionMutation({
        variables: {
          spaceId: space.id,
          gitCourseTopicSubmission: request,
        },
        updateQueries: {
          GitCourseSubmission: (prev, { mutationResult }) => {
            console.log('mutationResult', mutationResult);
            return { ...mutationResult.data! };
          },
        },
      });
      setCourseSubmission(transformCourseSubmissionResponse(topicSubmission.data?.payload!, courseResponse?.course!));
    } catch (e) {
      showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
      throw e;
    }
  };

  const markSummaryCompleted = async (chapterId: string, summaryId: string) => {
    const { topicSub } = courseAndTopicSubmission(chapterId);
    const updatedTopicSubmission = {
      ...topicSub,
      summaries: {
        ...topicSub.summaries,
        [summaryId]: {
          key: summaryId,
          status: TopicItemStatus.Completed,
        },
      },
    };
    await upsertTopicSubmission(courseKey, updatedTopicSubmission);
  };

  const markExplanationCompleted = async (chapterId: string, explanationKey: string) => {
    const { topicSub } = courseAndTopicSubmission(chapterId);
    const updatedTopicSubmission = {
      ...topicSub,
      explanations: {
        ...topicSub.explanations,
        [explanationKey]: {
          key: explanationKey,
          status: TopicItemStatus.Completed,
        },
      },
    };

    await upsertTopicSubmission(courseKey, updatedTopicSubmission);
  };

  const saveReadingAnswer = async (chapterId: string, readingId: string, questionUUid: string, questionResponse: CourseQuestionSubmission) => {
    const { topicSub } = courseAndTopicSubmission(chapterId);
    const questions: Record<string, CourseQuestionSubmission> = {
      ...topicSub.readings?.[readingId].questions,
      [questionUUid]: {
        uuid: questionUUid,
        status: questionResponse.status,
        answers: questionResponse.answers,
      },
    };

    const readings: Record<string, ReadingSubmission> = {
      ...topicSub.readings,
      [readingId]: {
        uuid: readingId,
        questions: questions,
        // TODO: this needs to be made dynamic
        status: TopicItemStatus.Completed,
      },
    };
    const updatedTopicSubmission = {
      ...topicSub,
      readings: readings,
    };

    await upsertTopicSubmission(courseKey, updatedTopicSubmission);
  };

  const markReadingCompleted = async (chapterId: string, readingId: string) => {
    const { courseSub, topicSub } = courseAndTopicSubmission(chapterId);
    const readings: Record<string, ReadingSubmission> = {
      ...topicSub.readings,
      [readingId]: {
        uuid: readingId,
        status: TopicItemStatus.Completed,
      },
    };
    const updatedTopicSubmission = {
      ...topicSub,
      readings: readings,
    };

    await upsertTopicSubmission(courseKey, updatedTopicSubmission);
  };

  const saveAnswer = async (chapterId: string, questionUUid: string, questionResponse: CourseQuestionSubmission) => {
    const { topicSub } = courseAndTopicSubmission(chapterId);
    const updatedTopicSubmission = {
      ...topicSub,
      questions: {
        ...topicSub.questions,
        [questionUUid]: {
          uuid: questionUUid,
          answers: questionResponse.answers,
          status: questionResponse.status,
        },
      },
    };

    await upsertTopicSubmission(courseKey, updatedTopicSubmission);
  };

  const isTopicComplete = (topic: CourseTopicFragment) => {
    return (
      !!(topic.readings?.length || topic.summaries?.length || topic.questions?.length || topic.explanations?.length) &&
      isAllSummariesComplete(topic) &&
      isAllReadingsComplete(topic) &&
      isAllEvaluationsComplete(topic) &&
      isAllExplanationsComplete(topic)
    );
  };

  const correctAndWrongAnswerCounts = (topicKey: string): { correctAnswers: number; wrongAnswers: number } => {
    const tempTopicSubmission = courseSubmission?.topicSubmissionsMap?.[topicKey];
    if (!tempTopicSubmission) {
      return { correctAnswers: 0, wrongAnswers: 0 };
    }
    const { correctAnswers } = tempTopicSubmission;
    return {
      correctAnswers: Object.values(correctAnswers || {}).filter((correct) =>
        isEqual(correct.answerKeys.sort(), tempTopicSubmission.questions[correct.uuid].answers.sort() || [])
      ).length,
      wrongAnswers: Object.values(correctAnswers || {}).filter(
        (correct) => !isEqual(correct.answerKeys.sort(), tempTopicSubmission.questions[correct.uuid].answers.sort() || [])
      ).length,
    };
  };

  const submitCourseTopic = async (topicKey: string) => {
    if (!isAllEvaluationsComplete(getTopic(topicKey))) {
      showNotification({ type: 'error', message: $t('courses.view.completeAllQuestionOfChapterToSubmit') });
      return;
    }

    const topicSubmission = courseSubmission?.topicSubmissionsMap[topicKey];

    if (!topicSubmission) {
      console.error('No topic submission', courseSubmission?.topicSubmissionsMap);
      showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
      return;
    }

    const request = getTopicSubmissionInput(courseKey, topicSubmission);
    if (!request) {
      console.error('No topic input');
      showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
      return;
    }

    if (!courseSubmission) {
      console.error('No course submission');
      showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
      return;
    }

    try {
      const submitTopicResponse = await submitGitCourseTopicMutation({
        variables: {
          spaceId: space.id,
          gitCourseTopicSubmission: request,
        },
        updateQueries: {
          GitCourseSubmission: (prev, { mutationResult }) => {
            return mutationResult.data!;
          },
        },
      });
      const topicSubmitResponse = submitTopicResponse.data?.payload;
      if (topicSubmitResponse) {
        setCourseSubmission(transformCourseSubmissionResponse(topicSubmitResponse, courseResponse?.course!));
      } else {
        console.error(submitTopicResponse);
        showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
      }
    } catch (e) {
      console.error(e);
      showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
    }
  };

  const submitCourse = async () => {
    const submission = courseSubmission;
    if (!submission) {
      console.error('No course submission present');
      showNotification({ type: 'error', message: $t('notify.somethingWentWrong') });
      return;
    }

    const areAllQuestionsAttempted = Object.values(submission.topicSubmissionsMap).every((ts) => isAllEvaluationsComplete(getTopic(ts.topicKey)));
    if (!areAllQuestionsAttempted) {
      console.error('All questions are not answered');
      showNotification({ type: 'error', message: $t('courses.view.completeAllChapterQuestionsToSubmit') });

      return;
    }

    try {
      const result = await submitGitCourseMutation({
        variables: {
          spaceId: space.id,
          input: {
            uuid: submission.uuid,
            courseKey: submission.courseKey,
          },
        },
        updateQueries: {
          GitCourseSubmission: (prev, { mutationResult }) => {
            return mutationResult.data!;
          },
        },
      });

      const submissionResponse = result.data?.payload;
      if (submissionResponse) {
        setCourseSubmission(transformCourseSubmissionResponse(submissionResponse, courseResponse?.course!));

        showNotification({ type: 'success', message: $t('courses.view.courseSubmitSuccess') });
      } else {
        console.error('courses.view.chapterSubmitError');
        showNotification({ type: 'error', message: $t('courses.view.chapterSubmitError') });
      }
    } catch (e) {
      console.error(e);
      showNotification({ type: 'error', message: $t('courses.view.chapterSubmitError') });
    }
  };

  //... Rest of your functions and transformations

  return {
    courseSubmission,
    getTopic,
    markReadingCompleted,
    saveReadingAnswer,
    markSummaryCompleted,
    markExplanationCompleted,
    saveAnswer,
    submitCourse,
    submitCourseTopic,
    upsertTopicSubmission,
    isTopicComplete,
    isAllReadingsComplete,
    isAllExplanationsComplete,
    isAllSummariesComplete,
    isAllEvaluationsComplete,
    isTopicSubmissionInSubmittedStatus,
    correctAndWrongAnswerCounts,
    getTopicSubmission,
  };
};
