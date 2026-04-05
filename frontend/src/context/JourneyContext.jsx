import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { journeyAPI } from '../services/journeyApi.js';
import { useAuth } from './AuthContext.jsx';

const JourneyContext = createContext();

export const useJourney = () => {
  const context = useContext(JourneyContext);
  if (!context) {
    throw new Error('useJourney must be used within a JourneyProvider');
  }
  return context;
};

export const JourneyProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // Fetch active journey
  const { data: journey, isLoading: journeyLoading, error: journeyError } = useQuery({
    queryKey: ['journey'],
    queryFn: journeyAPI.getActive,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
    refetchOnWindowFocus: true,
  });

  // Fetch user progress
  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['journey-progress'],
    queryFn: journeyAPI.getProgress,
    enabled: isAuthenticated && !!journey?.isActive,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });

  // Mutations
  const startMutation = useMutation({
    mutationFn: journeyAPI.start,
    onSuccess: (data) => {
      console.log('Journey started, progress:', data);
      queryClient.setQueryData(['journey-progress'], data);
    },
    onError: (err) => {
      console.error('Failed to start journey:', err);
    },
  });

  const completeResourceMutation = useMutation({
    mutationFn: ({ levelNumber, resourceType, resourceId }) =>
      journeyAPI.completeResource(levelNumber, resourceType, resourceId),
    onSuccess: () => queryClient.invalidateQueries(['journey-progress']),
  });

  const completeLevelMutation = useMutation({
    mutationFn: ({ levelNumber }) => journeyAPI.completeLevel(levelNumber),
    onSuccess: () => queryClient.invalidateQueries(['journey-progress']),
  });

  const value = {
    journey,
    loading: journeyLoading || progressLoading,
    error: journeyError,
    progress,
    startJourney: startMutation.mutateAsync,
    completeResource: completeResourceMutation.mutateAsync,
    completeLevel: completeLevelMutation.mutateAsync,
    hasStarted: !!progress,
    currentLevel: progress?.currentLevel || 1,
    overallProgress: progress?.overallProgress || 0,
    isCompleted: progress?.isCompleted || false,
  };

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
};
