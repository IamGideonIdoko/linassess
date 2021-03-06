import React, { useState } from 'react';
import { Container, FormControl, FormLabel, FormHelperText, Select, Button, Box, useToast } from '@chakra-ui/react';
import axios from 'axios';
import useStore, { Question } from '../store';
import { constants, randomizeQuestions } from '../helper';

function StartScreen() {
    const quizList = useStore((state) => state.quizList);
    const setQuestions = useStore((state) => state.setQuestions);
    const setSelectedQuestions = useStore((state) => state.setSelectedQuestions);
    const setCurrentQuizInfo = useStore((state) => state.setCurrentQuizInfo);
    const setCurrentScreen = useStore((state) => state.setCurrentScreen);
    const [quiz, setQuiz] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const toast = useToast();

    const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setQuiz(e.target.value);
    };

    const handleStart = async () => {
        if (!quiz)
            return toast({
                description: 'Select a skill',
                status: 'warning',
                duration: 3000,
                isClosable: true,
                position: 'bottom',
            });
        if (!navigator.onLine)
            return toast({
                description: 'No active connection',
                status: 'error',
                duration: 3000,
                isClosable: true,
                position: 'bottom',
            });
        try {
            setLoading(true);
            const res = await axios.get(`${constants.baseUrl}/output/data-prod/${quiz}`);
            setLoading(false);
            if (Array.isArray(res.data)) {
                // eslint-disable-next-line no-underscore-dangle
                const questions = res.data.filter((item: Question) => item._ps >= 0);
                if (questions.length === 0)
                    return toast({
                        description: 'Not available right now',
                        status: 'info',
                        duration: 3000,
                        isClosable: true,
                        position: 'bottom',
                    });
                setQuestions(questions);
                const fileInfo = quizList.find((item) => item.fileName === quiz);
                if (fileInfo) setCurrentQuizInfo(fileInfo);
                setSelectedQuestions(randomizeQuestions(questions).slice(0, 15));
                return setCurrentScreen('quiz');
            }
            return console.log(
                '%cerror StartScreen.tsx: ',
                'color: red; display: block; width: 100%;',
                'Quizzes not found',
            );
        } catch (err) {
            setLoading(false);
            return console.log('%cerror StartScreen.tsx: ', 'color: red; display: block; width: 100%;', err);
        }
    };

    return (
        <Box py="3rem">
            <Container bg="white" width="92%" maxW="md" shadow="sm" p="1rem" mt="0rem" borderRadius="6px">
                <FormControl>
                    <FormLabel htmlFor="skills">Select Skill</FormLabel>
                    <Select id="skills" value={quiz} onChange={handleSelect} placeholder="Select skill">
                        {quizList.map((item) => (
                            <option value={item.fileName}>{item.name}</option>
                        ))}
                    </Select>
                    <FormHelperText>
                        You will be given 15 questions or less (1min &amp; 30secs for each).
                    </FormHelperText>
                    <Box textAlign="right" mt="1rem">
                        {' '}
                        <Button
                            type="submit"
                            h="2rem"
                            px="1rem"
                            pb="3px"
                            borderRadius="10rem"
                            bg="#0072b1"
                            color="white"
                            isLoading={loading}
                            loadingText="Start"
                            colorScheme="linkedin"
                            spinnerPlacement="end"
                            onClick={handleStart}
                        >
                            Start
                        </Button>
                    </Box>
                </FormControl>
            </Container>
        </Box>
    );
}

export default StartScreen;
