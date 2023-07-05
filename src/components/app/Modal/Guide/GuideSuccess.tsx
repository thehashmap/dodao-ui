import { Dialog, Transition } from '@headlessui/react';
import { ArrowDownCircleIcon } from '@heroicons/react/24/outline';
import { ChangeEvent, FormEvent, Fragment, MouseEvent, useEffect, useRef, useState } from 'react';

export interface FeedbackState {
  questions: boolean;
  content: boolean;
  clarity: boolean;
  UI: boolean;
  loading: boolean;
  other: string;
  [key: string]: boolean | string;
}

const feedbackOptions = [
  { name: 'content', label: 'Usefulness of Guides' },
  { name: 'questions', label: 'Questions' },
  { name: 'clarity', label: 'Clarity of Explanations' },
  { name: 'UI', label: 'User Interface' },
  { name: 'loading', label: 'Loading' },
  { name: 'other', label: 'Other' },
];

export interface GuideSuccesspProps {
  page: Number;
  userKey: string;
  guideName: string;
}

interface SuccessObjectProps {
  guideName: string;
  initialRatings: Number;
  finalRatings: Number;
  Feedback: FeedbackState;
}

const successObject: SuccessObjectProps = {
  guideName: '',
  initialRatings: -1,
  finalRatings: -1,
  Feedback: {
    questions: false,
    content: false,
    clarity: false,
    UI: false,
    loading: false,
    other: '',
  },
};

const GuideSuccessModal: React.FC<GuideSuccesspProps> = ({ page, userKey, guideName }) => {
  const [open, setOpen] = useState(true);
  const [success, setsuccess] = useState(true);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [finalSelectedRating, setFinalSelectedRating] = useState<number | null>(null);
  const [shakeEmojis, setShakeEmojis] = useState(false); // State to control the shaking effect

  const skipButtonRef = useRef(null);

  const ratings = [
    { number: 1, label: '🙁' },
    { number: 2, label: '😕' },
    { number: 3, label: '😐' },
    { number: 4, label: '😄' },
    { number: 5, label: '😊' },
  ];

  const handleSubmit = (rating: number | null) => {
    if (rating === null) {
      setShakeEmojis(true); // Start the shaking effect
      setTimeout(() => {
        setShakeEmojis(false); // Stop the shaking effect after 1 second
      }, 1000);
    } else {
      if (page === 0) {
        successObject.initialRatings = rating;
      } else {
        successObject.finalRatings = rating;

        console.log(successObject, 'this is final rate\n');
      }
      const fr = successObject.finalRatings as number;
      const ir = successObject.initialRatings as number;
      if (fr - ir > 0) {
        setsuccess(true);
      } else {
        setsuccess(false);
      }
      successObject.guideName = guideName; // Set guideName
      localStorage.setItem(guideName, JSON.stringify(successObject));

      setOpen((prev) => !prev);
    }
  };

  const handleRatingClick = (number: number) => {
    if (page === 0) {
      setSelectedRating(number);
    } else setFinalSelectedRating(number);

    setShakeEmojis(false); // Stop the shaking effect when a rating is selected
  };

  const handleButtonClick = () => {
    if (page == 0) {
      handleSubmit(selectedRating);
    }
  };

  //  Guide Feedback Functions

  const [finalFeedback, setFinalFeedback] = useState<FeedbackState>({
    questions: false,
    content: false,
    clarity: false,
    UI: false,
    loading: false,
    other: '',
  });

  const handleChange = (event: MouseEvent<HTMLButtonElement>) => {
    const { name } = event.currentTarget;
    setFinalFeedback((prevFeedback) => ({
      ...prevFeedback,
      [name]: !prevFeedback[name],
    }));
  };

  const handleOtherChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target;
    setFinalFeedback((prevFeedback) => ({
      ...prevFeedback,
      other: value,
    }));
  };

  const handleSubmitFeedBack = (event: FormEvent) => {
    event.preventDefault();

    const updatedSuccessObject: SuccessObjectProps = {
      ...successObject,
      Feedback: finalFeedback,
    };

    handleSubmit(finalSelectedRating);
    console.log(finalFeedback);
  };

  const [ratingsFilled, setRatingsFilled] = useState(false);

  useEffect(() => {
    setRatingsFilled((successObject.finalRatings as number) > 0 && (successObject.initialRatings as number) > 0);
  }, [success]);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={skipButtonRef} onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                  <div className="mt-2 text-center sm:mt-1">
                    <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900">
                      <span>{page ? 'Boost Your Confidence! Rate Your Mastery' : 'Assess Your Familiarity! How Well Do You Know?'}</span>
                      <br />
                      <a className="text-xs text-blue-700 cursor-pointer underline mt-2" onClick={() => setOpen(false)}>
                        Skip{' '}
                      </a>
                    </Dialog.Title>
                    <div
                      className={`mt-4 flex justify-center ${
                        shakeEmojis && (page === 0 ? selectedRating === null : finalSelectedRating === null) ? 'animate-shake' : ''
                      }`}
                      style={{ animationDuration: '.5s', animationIterationCount: 'infinite' }}
                    >
                      {ratings.map(({ number, label }) => (
                        <button
                          key={number}
                          type="button"
                          className={`inline-flex items-center justify-center w-20 h-16 text-3xl rounded-full ${
                            (page === 0 ? selectedRating === number : finalSelectedRating === number) ? 'bg-blue-500 text-white' : ''
                          } hover:scale-110 transition-transform duration-200`}
                          onClick={() => handleRatingClick(number)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {ratingsFilled && page === 1 && (
                  <div className="flex flex-col items-center">
                    <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900">
                      {ratingsFilled && success ? 'What do you like the most?' : 'What do you want us to improve on'}
                    </Dialog.Title>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {feedbackOptions.map((option) => (
                        <button
                          key={option.name}
                          name={option.name}
                          onClick={handleChange}
                          className={`w-full h-24 p-3 border-2 rounded-md ${finalFeedback[option.name] ? 'bg-blue-500 text-white' : ''}`}
                        >
                          <ArrowDownCircleIcon className="w-full h-[50%]" />
                          <h2>{option.label}</h2>
                        </button>
                      ))}
                    </div>
                    {finalFeedback.other && (
                      <textarea onChange={handleOtherChange} className="mt-4 border-2 rounded-md w-full sm:w-[70%] h-40" placeholder="Optional" />
                    )}
                  </div>
                )}

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2"
                    onClick={page === 0 ? handleButtonClick : handleSubmitFeedBack}
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0"
                    onClick={() => setOpen(false)}
                    ref={skipButtonRef}
                  >
                    Skip
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
        <style>
          {`
          @keyframes shake {
            0% {
              transform: translateX(0);
            }
            25% {
              transform: translateX(-5px);
            }
            50% {
              transform: translateX(0);
            }
            75% {
              transform: translateX(5px);
            }
            100% {
              transform: translateX(0);
            }
          }

          .animate-shake {
            animation-name: shake;
          }
          `}
        </style>
      </Dialog>
    </Transition.Root>
  );
};

export default GuideSuccessModal;
