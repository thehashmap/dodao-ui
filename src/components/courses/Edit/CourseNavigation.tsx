import { Tree } from '@/components/app/TreeView/Tree';
import { TreeNodeType } from '@/components/app/TreeView/TreeNode';
import Button from '@/components/core/buttons/Button';
import AddIcon from '@/components/core/icons/AddIcon';
import { ItemTypes } from '@/components/courses/View/CourseDetailsRightSection';
import { CourseSubmissionHelper, QuestionStatus, TopicItemStatus, TopicStatus } from '@/components/courses/View/useCourseSubmission';
import { CourseHelper } from '@/components/courses/View/useViewCourse';
import {
  CourseDetailsFragment,
  CourseExplanationFragment,
  CourseReadingFragment,
  CourseSummaryFragment,
  CourseTopicFragment,
  Space,
} from '@/graphql/generated/generated-types';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

interface CourseNavigationProps {
  course: CourseDetailsFragment;
  space: Space;
  showAddModal: () => void;
  courseHelper: CourseHelper;
  submissionHelper: CourseSubmissionHelper;
  topicKey?: string;
  itemType?: ItemTypes;
  itemKey?: string;
}

const ClickableDiv = styled.div`
  cursor: pointer;
`;

const Container = styled.div`
  .icon {
    display: flex;
  }

  .nav-item {
    @apply mb-2;
    color: var(--text-color);

    &.active {
      background: rgba(255, 255, 255, 0.2);
      @apply font-bold text-primary;

      .icon {
        svg {
          fill: var(--primary-color);
        }
      }
    }
  }

  .item-title {
    max-height: 40px;
  }

  .nav-list {
    margin-left: 0;
    list-style-type: none;
  }

  /* Add CSS class to underline text of currently open child node */
  .underline {
    text-decoration: underline;
  }
`;

function Checkmark() {
  return (
    <div className="w-4 text-green-700 mr-2">
      <CheckCircleIcon width={20} height={20} />
    </div>
  );
}
function getReadings(
  courseKey: string,
  submissionHelper: CourseSubmissionHelper,
  topic: CourseTopicFragment,
  readings: CourseReadingFragment[],
  itemKey: string
) {
  return readings.map((reading, i) => {
    const isActive = itemKey === reading.uuid;

    const isComplete = submissionHelper.getTopicSubmission(topic.key)?.readings?.[reading.uuid]?.status === TopicItemStatus.Completed;

    return {
      component: (
        <div className="flex">
          {isComplete && <Checkmark />}
          <Link
            key={reading.uuid}
            className={`flex items-center ${isActive ? 'underline' : ''}`}
            href={`/courses/view/${courseKey}/${topic.key}/readings/${reading.uuid}`}
          >
            <div>{reading.title}</div>
          </Link>
        </div>
      ),
    };
  });
}

function getExplanations(
  courseKey: string,
  submissionHelper: CourseSubmissionHelper,
  topic: CourseTopicFragment,
  explanations: CourseExplanationFragment[],
  itemKey: string
) {
  return explanations.map((explanation, i) => {
    const isActive = itemKey === explanation.key;
    const isComplete = submissionHelper.getTopicSubmission(topic.key)?.explanations?.[explanation.key]?.status === TopicItemStatus.Completed;
    return {
      component: (
        <div className="flex align-middle items-center">
          {isComplete && <Checkmark />}
          <Link
            key={explanation.key}
            className={`flex items-center ${isActive ? 'underline' : ''}`}
            href={`/courses/view/${courseKey}/${topic.key}/explanations/${explanation.key}`}
          >
            {explanation.title}
          </Link>
        </div>
      ),
    };
  });
}

function getSummaries(
  courseKey: string,
  submissionHelper: CourseSubmissionHelper,
  topic: CourseTopicFragment,
  summaries: CourseSummaryFragment[],
  itemKey: string
) {
  return summaries.map((summary, i) => {
    const isActive = itemKey === summary.key;
    const isComplete = submissionHelper.getTopicSubmission(topic.key)?.summaries?.[summary.key]?.status === TopicItemStatus.Completed;
    return {
      component: (
        <div className="flex align-middle items-center">
          {isComplete && <Checkmark />}
          <Link
            key={summary.key}
            className={`flex items-center ${isActive ? 'underline' : ''}`}
            href={`/courses/view/${courseKey}/${topic.key}/summaries/${summary.key}`}
          >
            <div>{summary.title}</div>
          </Link>
        </div>
      ),
    };
  });
}

function getTreeData(course: CourseDetailsFragment, submissionHelper: CourseSubmissionHelper, itemKey: string) {
  return course.topics.map((chapter, i) => {
    const readings: TreeNodeType[] = getReadings(course.key, submissionHelper, chapter, chapter.readings, itemKey);
    const explanations: TreeNodeType[] = getExplanations(course.key, submissionHelper, chapter, chapter.explanations, itemKey);
    const summaries: TreeNodeType[] = getSummaries(course.key, submissionHelper, chapter, chapter.summaries, itemKey);
    const topicSubmission = submissionHelper.getTopicSubmission(chapter.key);

    const children: TreeNodeType[] = [];
    if (readings.length) {
      children.push({
        component: (
          <ClickableDiv key={chapter.key + '_readings'} className="flex items-center">
            {Object.keys(topicSubmission?.readings || {}).length === chapter.readings.length &&
              Object.values(topicSubmission?.readings || {}).every((r) => r.status === TopicItemStatus.Completed) && <Checkmark />}
            <div>Videos</div>
          </ClickableDiv>
        ),
        children: readings,
      });
    }
    if (explanations.length) {
      children.push({
        component: (
          <div key={chapter.key + '_explanations'} className="flex items-center">
            {Object.keys(topicSubmission?.explanations || {}).length === chapter.explanations.length &&
              Object.values(topicSubmission?.explanations || {}).every((r) => r.status === TopicItemStatus.Completed) && <Checkmark />}
            <div>Explanations</div>
          </div>
        ),
        children: explanations,
      });
    }
    if (summaries.length) {
      children.push({
        component: (
          <div key={chapter.key + '_summaries'} className="flex items-center">
            {Object.keys(topicSubmission?.summaries || {}).length === chapter.summaries.length &&
              Object.values(topicSubmission?.summaries || {}).every((r) => r.status === TopicItemStatus.Completed) && <Checkmark />}
            <div>Summaries</div>
          </div>
        ),
        children: summaries,
      });
    }
    if (chapter.questions.length) {
      children.push({
        component: (
          <Link
            key={chapter.key + '_questions'}
            className={`flex items-center ${itemKey === '0' ? 'underline' : ''}`}
            href={`/courses/view/${course.key}/${chapter.key}/questions/0`}
          >
            {Object.keys(topicSubmission?.questions || {}).length === chapter.questions.length &&
              Object.values(topicSubmission?.questions || {}).every((r) => r.status === QuestionStatus.Completed) && <Checkmark />}
            <div>Questions</div>
          </Link>
        ),
        children: [],
      });
    }

    children.push({
      component: (
        <Link
          key={chapter.key + '_chapter_submission'}
          className={`flex items-center ${itemKey === 'submission' ? 'underline' : ''}`}
          href={`/courses/view/${course.key}/${chapter.key}/submission`}
        >
          {topicSubmission?.status === TopicStatus.Completed && <Checkmark />}
          <div>Chapter Submission</div>
        </Link>
      ),
      children: [],
    });

    const isActive = itemKey === chapter.key;
    return {
      component: (
        <Link
          key={chapter.key + '_chapter_root'}
          className={`flex items-center ${isActive ? 'underline' : ''}`}
          href={`/courses/view/${course.key}/${chapter.key}`}
        >
          <div>{chapter.title}</div>
        </Link>
      ),
      children: children,
    };
  });
}

const CourseComponent: React.FC<CourseNavigationProps> = ({ course, showAddModal, topicKey, itemKey, itemType, submissionHelper }) => {
  const isCourseAdmin = true;
  const [openNodes, setOpenNodes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (topicKey && itemKey && itemType) {
      setOpenNodes({
        ...openNodes,
        '1': topicKey + '_chapter_root',
        '2': topicKey + '_' + itemType,
      });

      return;
    }
    if (topicKey) {
      setOpenNodes({
        ...openNodes,
        '1': topicKey! + '_chapter_root',
      });
    }
  }, [topicKey, itemKey, itemType]);

  const treeData: TreeNodeType[] = getTreeData(course, submissionHelper, itemKey || '0');

  return (
    <Container className="p-4 bg-skin-header-bg rounded-l-lg border-skin-border h-full w-full text-sm">
      {isCourseAdmin && (
        <Button primary variant="contained" className="w-full mb-4" onClick={showAddModal}>
          <AddIcon /> Add
        </Button>
      )}
      <Tree data={treeData} openNodes={openNodes} setOpenNodes={setOpenNodes} />
    </Container>
  );
};

export default CourseComponent;
