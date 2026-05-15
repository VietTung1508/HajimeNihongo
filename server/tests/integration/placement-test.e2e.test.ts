import 'reflect-metadata'
import type {} from '../../src/types/express'
import assert from 'node:assert/strict'
import {after, before, describe, it} from 'node:test'
import type {Server} from 'node:http'
import argon2 from 'argon2'
import {app} from '../../src/app'
import {initDI, DI} from '../../src/utils/di'
import {User} from '../../src/entities/User'
import {UserOnboarding} from '../../src/entities/UserOnboading'
import {Word} from '../../src/entities/Word'
import {Grammar} from '../../src/entities/Grammar'
import {LevelEnum, StudyPaceEnum, StudyPreferenceEnum} from '../../src/enums/onboarding.enum'
import {UserRole} from '../../src/enums/auth.enum'

describe('Placement Test E2E', () => {
  let server: Server
  let baseUrl: string
  let token: string
  let user: User
  const runId = Date.now()
  const entSeqBase = runId % 1_000_000_000

  before(async () => {
    await initDI()

    user = DI.em.create(User, {
      email: `placement-${runId}@example.com`,
      username: `placement-${runId}`,
      password: await argon2.hash('password'),
      role: UserRole.USER,
      phone_number: null,
      createdAt: new Date(),
    } as never)

    const onboarding = DI.em.create(UserOnboarding, {
      user,
      level: LevelEnum.N3,
      studyPace: StudyPaceEnum.RELAX,
      studyPreference: StudyPreferenceEnum.BOTH,
      hasTakenPlacementTest: false,
    })

    const words = Array.from({length: 10}, (_, index) =>
      DI.em.create(Word, {
        entSeq: entSeqBase + index,
        kanji: `試験${index}`,
        reading: `しけん${index}`,
        jlptLevel: 3,
        isCommon: false,
      }),
    )

    const grammars = Array.from({length: 10}, (_, index) =>
      DI.em.create(Grammar, {
        grammarPoint: `integration grammar ${entSeqBase}-${index}`,
        meaning: `integration meaning ${index}`,
        level: LevelEnum.N3,
      }),
    )

    await DI.em.persistAndFlush([user, onboarding, ...words, ...grammars])

    server = app.listen(0)
    const address = server.address()
    assert.notEqual(address, null)
    assert.notEqual(typeof address, 'string')
    baseUrl = `http://127.0.0.1:${(address as {port: number}).port}`

    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({email: user.email, password: 'password'}),
    })
    const loginBody = await loginResponse.json() as {accessToken: string}
    token = loginBody.accessToken
  })

  after(async () => {
    if (user?.id) {
      await DI.em.nativeDelete(UserOnboarding, {user})
      await DI.em.nativeDelete(User, {id: user.id})
    }
    await DI.em.nativeDelete(Word, {entSeq: {$gte: entSeqBase, $lt: entSeqBase + 10}})
    await DI.em.nativeDelete(Grammar, {grammarPoint: {$like: `integration grammar ${entSeqBase}-%`}})
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()))
    }
    await DI.orm?.close(true)
  })

  it('starts and submits a placement quiz', async () => {
    const startResponse = await fetch(`${baseUrl}/placement-test/start`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({level: LevelEnum.N3}),
    })

    assert.equal(startResponse.status, 200)
    const startBody = await startResponse.json() as {
      questions: Array<{key: string}>
      attemptNumber: number
    }
    assert.equal(startBody.questions.length, 20)

    const answers = Object.fromEntries(
      startBody.questions.map((question, index) => [question.key, index < 16]),
    )

    const submitResponse = await fetch(`${baseUrl}/placement-test/submit`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        level: LevelEnum.N3,
        answers,
        attemptNumber: startBody.attemptNumber,
      }),
    })

    assert.equal(submitResponse.status, 200)
    const submitBody = await submitResponse.json() as {passed: boolean; score: number}
    assert.equal(submitBody.passed, true)
    assert.equal(submitBody.score, 80)
  })
})
