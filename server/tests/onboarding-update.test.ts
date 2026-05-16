import 'reflect-metadata'
import assert from 'node:assert/strict'
import {describe, it} from 'node:test'
import {LevelEnum, StudyPaceEnum, StudyPreferenceEnum} from '../src/enums/onboarding.enum'

// Inline logic that mirrors the cascade rule in the updateOnboarding handler:
// changing level resets hasTakenPlacementTest and placementTestCompletedAt.
function applyOnboardingUpdate(
  current: {
    level: LevelEnum
    studyPace: StudyPaceEnum
    studyPreference: StudyPreferenceEnum
    hasTakenPlacementTest: boolean
    placementTestCompletedAt: Date | null
  },
  patch: Partial<{level: LevelEnum; studyPace: StudyPaceEnum; studyPreference: StudyPreferenceEnum}>,
) {
  const updated = {...current}

  if (patch.level !== undefined && patch.level !== current.level) {
    updated.hasTakenPlacementTest = false
    updated.placementTestCompletedAt = null
  }

  if (patch.level !== undefined) updated.level = patch.level
  if (patch.studyPace !== undefined) updated.studyPace = patch.studyPace
  if (patch.studyPreference !== undefined) updated.studyPreference = patch.studyPreference

  return updated
}

describe('onboarding update logic', () => {
  const base = {
    level: LevelEnum.N3,
    studyPace: StudyPaceEnum.RELAX,
    studyPreference: StudyPreferenceEnum.BOTH,
    hasTakenPlacementTest: true,
    placementTestCompletedAt: new Date('2026-01-01'),
  }

  it('resets placement test when level changes (upgrade)', () => {
    const result = applyOnboardingUpdate(base, {level: LevelEnum.N2})
    assert.equal(result.level, LevelEnum.N2)
    assert.equal(result.hasTakenPlacementTest, false)
    assert.equal(result.placementTestCompletedAt, null)
  })

  it('resets placement test when level changes (downgrade)', () => {
    const result = applyOnboardingUpdate(base, {level: LevelEnum.N5})
    assert.equal(result.level, LevelEnum.N5)
    assert.equal(result.hasTakenPlacementTest, false)
    assert.equal(result.placementTestCompletedAt, null)
  })

  it('does NOT reset placement test when level is unchanged', () => {
    const result = applyOnboardingUpdate(base, {studyPace: StudyPaceEnum.RIGOROUS})
    assert.equal(result.hasTakenPlacementTest, true)
    assert.ok(result.placementTestCompletedAt !== null)
    assert.equal(result.studyPace, StudyPaceEnum.RIGOROUS)
  })

  it('updates studyPace without affecting level or placement test', () => {
    const result = applyOnboardingUpdate(base, {studyPace: StudyPaceEnum.DETERMINED})
    assert.equal(result.studyPace, StudyPaceEnum.DETERMINED)
    assert.equal(result.level, LevelEnum.N3)
    assert.equal(result.hasTakenPlacementTest, true)
  })

  it('updates studyPreference without affecting level or placement test', () => {
    const result = applyOnboardingUpdate(base, {studyPreference: StudyPreferenceEnum.GRAMMAR})
    assert.equal(result.studyPreference, StudyPreferenceEnum.GRAMMAR)
    assert.equal(result.hasTakenPlacementTest, true)
  })
})
