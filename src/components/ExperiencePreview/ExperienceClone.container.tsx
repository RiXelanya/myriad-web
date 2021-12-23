import React, {useEffect} from 'react';

import {useRouter} from 'next/router';

import {ExperienceEditor} from '../ExperienceEditor/ExperienceEditor';
import {useStyles} from './experience.style';

import {debounce} from 'lodash';
import {TopNavbarComponent, SectionTitle} from 'src/components/atoms/TopNavbar';
import {useExperienceHook} from 'src/hooks/use-experience-hook';
import {useUpload} from 'src/hooks/use-upload.hook';
import {Experience} from 'src/interfaces/experience';

export const ExperienceCloneContainer: React.FC = () => {
  const {searchTags, tags, searchPeople, people, experience, getDetail, cloneExperience} =
    useExperienceHook();
  const {uploadImage} = useUpload();
  const router = useRouter();
  const {experienceId} = router.query;
  const style = useStyles();

  useEffect(() => {
    if (experienceId) getDetail(experienceId);
  }, []);

  const onImageUpload = async (files: File[]) => {
    const url = await uploadImage(files[0]);
    if (url) return url;
    return '';
  };

  const handleCloneExperience = (newExperience: Partial<Experience>, newTags: string[]) => {
    cloneExperience(newExperience, newTags, (experienceId: string) => {
      router.push(`/experience/${experienceId}/preview`);
    });
  };

  const handleSearchTags = debounce((query: string) => {
    searchTags(query);
  }, 300);

  const handleSearchPeople = debounce((query: string) => {
    searchPeople(query);
  }, 300);

  return (
    <>
      <div className={style.mb}>
        <TopNavbarComponent
          description={'Clone Experience'}
          sectionTitle={SectionTitle.EXPERIENCE}
        />
      </div>
      <ExperienceEditor
        type={'Clone'}
        experience={experience}
        tags={tags}
        people={people}
        onSearchTags={handleSearchTags}
        onImageUpload={onImageUpload}
        onSearchPeople={handleSearchPeople}
        onSave={handleCloneExperience}
      />
    </>
  );
};