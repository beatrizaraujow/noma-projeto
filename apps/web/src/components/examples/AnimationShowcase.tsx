'use client';

import { useState } from 'react';
import {
  AnimatedButton,
  AnimatedCard,
  PageTransition,
  Skeleton,
  SkeletonCard,
  SkeletonList,
  SkeletonTable,
  SkeletonDashboard,
  SkeletonText,
  SuccessCheckmark,
  SuccessConfetti,
  SuccessToast,
  Draggable,
  SortableItem,
  DragHandle,
} from '@/components/common/animations';
import { motion } from 'framer-motion';
import { staggerContainerVariants, listItemVariants } from '@/components/common/animations/variants';

export function AnimationShowcase() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <PageTransition>
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Micro-interactions Showcase
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Demonstração de todas as animações e interações do NOMA
            </p>
          </div>

          {/* Button Animations */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              1. Button Animations
            </h2>
            <AnimatedCard className="p-6">
              <div className="flex flex-wrap gap-4">
                <AnimatedButton variant="primary">
                  Primary Button
                </AnimatedButton>
                <AnimatedButton variant="secondary">
                  Secondary Button
                </AnimatedButton>
                <AnimatedButton variant="ghost">
                  Ghost Button
                </AnimatedButton>
                <AnimatedButton variant="danger">
                  Danger Button
                </AnimatedButton>
              </div>
              <div className="flex flex-wrap gap-4 mt-4">
                <AnimatedButton variant="primary" size="sm">
                  Small
                </AnimatedButton>
                <AnimatedButton variant="primary" size="md">
                  Medium
                </AnimatedButton>
                <AnimatedButton variant="primary" size="lg">
                  Large
                </AnimatedButton>
              </div>
            </AnimatedCard>
          </section>

          {/* Card Hover Effects */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              2. Card Hover Effects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AnimatedCard hoverable clickable className="p-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  Hoverable & Clickable
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Passe o mouse e clique para ver o efeito
                </p>
              </AnimatedCard>
              <AnimatedCard hoverable className="p-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  Apenas Hover
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Card com efeito de elevação ao passar o mouse
                </p>
              </AnimatedCard>
              <AnimatedCard hoverable={false} className="p-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  Sem Animação
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Card estático sem hover effect
                </p>
              </AnimatedCard>
            </div>
          </section>

          {/* Stagger Animation */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              3. Stagger List Animation
            </h2>
            <AnimatedCard className="p-6">
              <motion.div
                variants={staggerContainerVariants}
                initial="initial"
                animate="animate"
                className="space-y-3"
              >
                {['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'].map((item) => (
                  <motion.div
                    key={item}
                    variants={listItemVariants}
                    className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg"
                  >
                    <p className="text-gray-900 dark:text-white">{item}</p>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatedCard>
          </section>

          {/* Skeleton Loaders */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                4. Skeleton Loaders
              </h2>
              <AnimatedButton
                variant="secondary"
                onClick={() => setShowSkeleton(!showSkeleton)}
              >
                {showSkeleton ? 'Esconder' : 'Mostrar'} Skeletons
              </AnimatedButton>
            </div>
            
            {showSkeleton && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-6"
              >
                <AnimatedCard className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Skeleton Text
                  </h3>
                  <SkeletonText lines={3} />
                </AnimatedCard>

                <AnimatedCard className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Skeleton Cards
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                </AnimatedCard>

                <AnimatedCard className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Skeleton List
                  </h3>
                  <SkeletonList items={4} />
                </AnimatedCard>

                <AnimatedCard className="p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Skeleton Table
                  </h3>
                  <SkeletonTable rows={5} columns={4} />
                </AnimatedCard>
              </motion.div>
            )}
          </section>

          {/* Success Animations */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              5. Success Animations
            </h2>
            <AnimatedCard className="p-6">
              <div className="flex flex-wrap gap-4">
                <AnimatedButton
                  variant="primary"
                  onClick={() => setShowSuccess(!showSuccess)}
                >
                  Toggle Checkmark
                </AnimatedButton>
                <AnimatedButton
                  variant="primary"
                  onClick={() => setShowConfetti(!showConfetti)}
                >
                  Toggle Confetti
                </AnimatedButton>
                <AnimatedButton
                  variant="primary"
                  onClick={() => setShowToast(true)}
                >
                  Show Success Toast
                </AnimatedButton>
                <AnimatedButton
                  variant="primary"
                  onClick={() => setShowToast(true)}
                >
                  Toast with Confetti
                </AnimatedButton>
              </div>
              
              <div className="mt-8 flex justify-center">
                <SuccessCheckmark show={showSuccess} size={80} />
              </div>
            </AnimatedCard>
          </section>

          {/* Drag Feedback */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              6. Drag Feedback
            </h2>
            <AnimatedCard className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Free Dragging
                </h3>
                <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg p-4 relative">
                  <Draggable
                    dragConstraints={{ left: 0, right: 400, top: 0, bottom: 200 }}
                    className="absolute"
                  >
                    <div className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
                      <DragHandle />
                      <span>Arraste-me!</span>
                    </div>
                  </Draggable>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Sortable List
                </h3>
                <div className="space-y-3">
                  {['Task 1', 'Task 2', 'Task 3', 'Task 4'].map((task) => (
                    <SortableItem
                      key={task}
                      id={task}
                      className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-3">
                        <DragHandle />
                        <span className="text-gray-900 dark:text-white">{task}</span>
                      </div>
                    </SortableItem>
                  ))}
                </div>
              </div>
            </AnimatedCard>
          </section>
        </div>
      </PageTransition>

      {/* Global Animations */}
      <SuccessConfetti show={showConfetti} onComplete={() => setShowConfetti(false)} />
      <SuccessToast
        message="Operação realizada com sucesso!"
        show={showToast}
        duration={3000}
        withConfetti={false}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
