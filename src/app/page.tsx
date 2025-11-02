'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { ClassesTab } from './components/ClassesTab';
import { EntitiesTab } from './components/EntitiesTab';
import { CanvasTab } from './components/CanvasTab';
import { useGameData } from './hooks/useGameData';
import { Skull } from 'lucide-react';

const Index = () => {
  const {
    classes,
    entities,
    addClass,
    updateClass,
    deleteClass,
    addEntity,
    updateEntity,
    deleteEntity,
    addAttributeToClass,
    deleteAttribute,
  } = useGameData();

  return (
    <>
    <div className="min-h-screen bg-background">
      {/*<header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Skull className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-pixel text-foreground tracking-wider">Enemy Designer</h1>
              <p className="text-sm font-chakra text-muted-foreground">
                Conception d'ennemis pour jeu vidéo
              </p>
            </div>
          </div>
        </div>
      </header>*/}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="entities" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-8 font-chakra">
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="entities">Entités</TabsTrigger>
            <TabsTrigger value="canvas">Tableau</TabsTrigger>
          </TabsList>

          <TabsContent value="classes">
            <ClassesTab
              classes={classes}
              onAddClass={addClass}
              onDeleteClass={deleteClass}
              onAddAttribute={addAttributeToClass}
              onDeleteAttribute={deleteAttribute}
            />
          </TabsContent>

          <TabsContent value="entities">
            <EntitiesTab
              entities={entities}
              classes={classes}
              onAddEntity={addEntity}
              onDeleteEntity={deleteEntity}
              onUpdateEntity={updateEntity}
            />
          </TabsContent>

          <TabsContent value="canvas">
            <CanvasTab
              entities={entities}
              classes={classes}
              onUpdateEntity={updateEntity}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  </>
  );
};

export default Index;
