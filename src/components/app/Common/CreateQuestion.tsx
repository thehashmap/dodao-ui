import Button from '@/components/app/Button';
import SidebarButton from '@/components/app/Button/SidebarButton';
import Checkbox from '@/components/app/Form/Checkbox';
import Radio from '@/components/app/Form/Radio';
import DeleteIcon from '@/components/app/Icons/DeleteIcon';
import Input from '@/components/app/Input';
import UnstyledTextareaAutosize from '@/components/app/TextArea/UnstyledTextareaAutosize';
import EllipsisDropdown from '@/components/core/dropdowns/EllipsisDropdown';
import { ByteQuestion, CourseQuestionFragment } from '@/graphql/generated/generated-types';
import { QuestionType } from '@/types/deprecated/models/enums';
import { GuideQuestion, GuideStepItem } from '@/types/deprecated/models/GuideModel';
import { QuestionError } from '@/types/errors/error';
import MinusCircle from '@heroicons/react/24/solid/MinusCircleIcon';
import styled from 'styled-components';

interface QuestionComponentProps {
  addChoice: (uuid: string) => void;
  item: GuideStepItem | ByteQuestion | CourseQuestionFragment;
  questionErrors?: QuestionError;
  removeChoice?: (uuid: string, key: string) => void;
  removeQuestion?: (uuid: string) => void;
  setAnswer?: (uuid: string, key: string, checked: boolean) => void;
  updateChoiceContent?: (uuid: string, key: string, content: string) => void;
  updateQuestionDescription?: (uuid: string, content: string) => void;
  updateAnswers?: (uuid: string, key: string, checked: boolean) => void;
  updateQuestionType: (questionId: string, type: QuestionType) => void;
}

const AddChoiceButton = styled.button` &:hover {
  background-color: var(--primary-hover-color)

// Change this color to your desired hover color }
`;

const questionTypes = [
  {
    text: 'Multiple Choice',
    action: QuestionType.MultipleChoice,
  },
  {
    text: 'Single Choice',
    action: QuestionType.SingleChoice,
  },
];

function QuestionComponent({
  addChoice,
  item,
  questionErrors,
  removeChoice,
  removeQuestion,
  setAnswer,
  updateChoiceContent,
  updateQuestionDescription,
  updateAnswers,
  updateQuestionType,
}: QuestionComponentProps) {
  const question = item as GuideQuestion;
  const disableChoiceEdit = false;

  return (
    <>
      <div>
        <div className="flex items-center justify-between pb-2">
          <div className="flex">
            <div className="pr-1 select-none">{question.type === QuestionType.MultipleChoice ? 'Multiple Choice' : 'Single Choice'}</div>
            <EllipsisDropdown
              items={questionTypes.map((item) => {
                return {
                  label: item.text,
                  key: item.action,
                };
              })}
              onSelect={(value) => updateQuestionType(question.uuid, value as QuestionType)}
            />
          </div>
          {removeQuestion && (
            <SidebarButton className="float-right my-2 mr-4" onClick={() => removeQuestion(question.uuid)}>
              <DeleteIcon />
            </SidebarButton>
          )}
        </div>
      </div>
      <div className="border md:rounded-lg p-4 mb-4 bg-skin-block-bg">
        <Button className="w-full h-96 mb-4 px-[16px] flex items-center" style={{ height: 'max-content' }}>
          <UnstyledTextareaAutosize
            modelValue={question.content}
            placeholder="Guide question content"
            className="input w-full text-left"
            onUpdate={(e) => updateQuestionDescription?.(question.uuid, e !== undefined ? e.toString() : '')}
          />
          {questionErrors?.content && <i className="iconfont iconwarning !text-red" data-v-abc9f7ae=""></i>}
        </Button>
        {question.choices.map((choice) => (
          <div key={choice.key} className="flex items-center">
            {question.type === QuestionType.SingleChoice ? (
              <Radio
                questionId={question.uuid}
                isSelected={question.answerKeys.includes(choice.key)}
                className={questionErrors?.answerKeys ? 'border-2 border-red' : ''}
                onChange={(e) => setAnswer?.(question.uuid, choice.key, !question.answerKeys.includes(choice.key))}
                id={choice.key}
                labelContent={''}
              />
            ) : (
              <Checkbox
                isChecked={question.answerKeys.includes(choice.key)}
                className={questionErrors?.answerKeys ? 'border-2 border-red' : ''}
                onChange={(e) => updateAnswers?.(question.uuid, choice.key, !question.answerKeys.includes(choice.key))}
                id={choice.key}
                labelContent={''}
              />
            )}
            <Input
              modelValue={choice.content}
              maxLength={256}
              disabled={disableChoiceEdit}
              onUpdate={(e) => updateChoiceContent?.(question.uuid, choice.key, e !== undefined ? e.toString() : '')}
              error={questionErrors?.choices?.[choice.order]?.content}
            />
            {!disableChoiceEdit && question.choices.length > 1 && (
              <div className="cursor-pointer p-2" onClick={() => removeChoice?.(question.uuid, choice.key)}>
                <MinusCircle></MinusCircle>
              </div>
            )}
          </div>
        ))}
        {!disableChoiceEdit && (
          <AddChoiceButton
            className="m-auto rounded-full text-2xl bg-primary w-[48px] text-white flex items-center font-bold justify-center h-[48px]"
            onClick={() => addChoice(question.uuid)}
          >
            <span className="mb-1">+</span>
          </AddChoiceButton>
        )}
      </div>
    </>
  );
}

export default QuestionComponent;
