import { CourseQuestionSubmission, CourseSubmissionHelper, QuestionStatus } from '@/components/courses/View/useCourseSubmission';
import { CourseHelper } from '@/components/courses/View/useViewCourse';
import { CourseDetailsFragment, Space, TopicCorrectAnswersFragment } from '@/graphql/generated/generated-types';
import isEqual from 'lodash/isEqual';
import sortBy from 'lodash/sortBy';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

interface IProps {
  course: CourseDetailsFragment;
  isCourseAdmin: boolean;
  space: Space;
  topicKey: string;
  courseHelper: CourseHelper;
  submissionHelper: CourseSubmissionHelper;
}

const TickMark = styled.span`
  content: '';
  left: 16px;
  top: 6px;
  width: 8px;
  height: 14px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  position: absolute;
`;

const QuestionNavItem = styled.div<{ isTopicSubmitted: boolean; questionStatus: string }>`
  width: 40px;
  position: relative;

  .indicator {
    height: 30px;
    border-radius: 30%;
    position: relative;

    ${(props) =>
      props.isTopicSubmitted &&
      props.questionStatus === 'completed' &&
      `
      background-color: #D32F2F;
    `}

    ${(props) =>
      props.isTopicSubmitted &&
      props.questionStatus !== 'completed' &&
      `
      background-color: transparent;
      border: 2px solid #D32F2F;
    `}
  }
`;

const QuestionNumber = styled.div<{ status?: QuestionStatus }>`
  background-color: ${(props) => (props.status === QuestionStatus.Completed ? 'green' : props.status === QuestionStatus.Skipped ? 'yellow' : 'red')};
  border-radius: 8%;
  color: #fff;
  text-align: center;
  padding: 0.5rem;
  position: absolute;
  top: -30px;
  left: 0;
  right: 0;
`;

function EvaluationComponent({ course, courseHelper, topicKey, submissionHelper }: IProps) {
  const topic = courseHelper.getTopic(topicKey);
  const [isTopicSubmitted, setIsTopicSubmitted] = useState<boolean>(false);
  const [questionsSubmissions, setQuestionsSubmissions] = useState<Record<string, CourseQuestionSubmission> | undefined>();
  const [correctAnswersOfTopic, setCorrectAnswersOfTopic] = useState<Record<string, TopicCorrectAnswersFragment> | undefined>();

  useEffect(() => {
    setIsTopicSubmitted(submissionHelper.isTopicSubmissionInSubmittedStatus(topicKey));
    setQuestionsSubmissions(submissionHelper.courseSubmission?.topicSubmissionsMap?.[topicKey]?.questions);
    setCorrectAnswersOfTopic(submissionHelper.courseSubmission?.topicSubmissionsMap?.[topicKey]?.correctAnswers);
  }, [course, topicKey, submissionHelper]);

  const getQuestionStatus = (question: any) => {
    if (isTopicSubmitted) {
      const questionRes: CourseQuestionSubmission | undefined = questionsSubmissions?.[question.uuid];
      const correctAnswers: TopicCorrectAnswersFragment | undefined = correctAnswersOfTopic?.[question.uuid];

      if (questionRes?.answers.length && correctAnswers?.answerKeys?.length) {
        const sortedResponse = sortBy(questionRes.answers, (answer) => answer.toLowerCase());
        const sortedCorrectAnswers = sortBy(correctAnswers.answerKeys, (answer) => answer.toLowerCase());
        if (isEqual(sortedResponse, sortedCorrectAnswers)) {
          return QuestionStatus.Completed;
        }
      }
      return QuestionStatus.Uncompleted;
    } else {
      const questionRes: CourseQuestionSubmission | undefined = questionsSubmissions?.[question.uuid];
      if (questionRes?.status === QuestionStatus.Completed && questionRes?.answers?.length > 0) {
        return QuestionStatus.Completed;
      } else if (questionRes?.status === QuestionStatus.Skipped) {
        return QuestionStatus.Skipped;
      }
      return QuestionStatus.Uncompleted;
    }
  };
  return (
    <div className="flex flex-wrap">
      {topic?.questions?.map((question, index) => {
        const questionStatus = getQuestionStatus(question) as QuestionStatus;
        return (
          <Link className="mx-2 my-2" href={`/courses/view/${course.key}/${topicKey}/questions/${index}`} key={index}>
            <div className="text-center">{index + 1}</div>
            <QuestionNavItem isTopicSubmitted={isTopicSubmitted} questionStatus={questionStatus} className={`question-nav-item ${questionStatus}`}>
              <div className="indicator">{questionStatus === QuestionStatus.Completed && isTopicSubmitted && <TickMark className="tick-mark" />}</div>
              <QuestionNumber className="mt-7" status={questionStatus} />
            </QuestionNavItem>
          </Link>
        );
      })}
    </div>
  );
}

export default EvaluationComponent;
