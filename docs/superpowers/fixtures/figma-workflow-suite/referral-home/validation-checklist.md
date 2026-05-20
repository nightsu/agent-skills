# MVP Validation Checklist — referral-home

本清单对应 spec §6.4 "成功标准(MVP 完工的定义)"。

## 1. P1 course-list 回归

- [ ] `figma-ui-api-mapper/tests/fixtures/course-list/` 存在
- [ ] fixture 覆盖旧 `figma-api-mapper` SKILL.md 的课程列表案例
- [ ] expected `component-mapping.md` 使用 Markdown 表格,不是旧 JSON
- [ ] 至少包含节点:`course_card_template`,`course_cover`,`course_title`,`teacher_name`,`course_price`,`promo_tag`
- [ ] `promo_tag` 保持 `ui_copy`
- [ ] 重复列表只映射一份模板,不出现重复 instance 行

## 2. referral-home C→D→E 链路

- [ ] phase A 输入存在:`figma-emit-spec/tests/fixtures/referral-home/inputs/clarified-requirement.md`
- [ ] phase B 输入存在:`figma-emit-spec/tests/fixtures/referral-home/inputs/ui-understanding.md`
- [ ] phase C-up 输入存在:`figma-emit-spec/tests/fixtures/referral-home/inputs/api-mapping.md`
- [ ] phase C-low 产物存在:`figma-emit-spec/tests/fixtures/referral-home/inputs/component-mapping.md`
- [ ] phase D 产物存在:`figma-emit-spec/tests/fixtures/referral-home/inputs/design-token-patch.md`
- [ ] phase E expected 主产物存在:`figma-emit-spec/tests/fixtures/referral-home/expected/implementation-spec.md`
- [ ] phase E expected open questions 存在:`figma-emit-spec/tests/fixtures/referral-home/expected/open-questions.md`

## 3. implementation-spec 可作为唯一主输入

- [ ] `implementation-spec.md` 包含 Page / Goal / Scope / Modules / API Usage / Interaction / Constraints
- [ ] 每个 module 包含 Responsibilities / Data Binding / Component / Design Tokens / States
- [ ] API 字段来自 `api-mapping.md`
- [ ] 视觉 token 来自 `design-token-patch.md`
- [ ] `label_drift` 自动校正记录在 `Auto Corrections Metadata`
- [ ] spec 中不引用 raw Figma JSON
- [ ] 下游 apply Agent 不需要读取 A/B/C/D 上游产物也能理解实现范围

## 4. superpowers handoff

- [ ] phase E review gate 后出现 handoff 菜单
- [ ] 选择 `superpowers:writing-plans`
- [ ] handoff 输入是 `implementation-spec.md`
- [ ] 不把 raw Figma JSON 传给 superpowers
- [ ] 不把五份上游产物作为主输入传给 superpowers
- [ ] `.workflow-prefs.json` 记录 `"handoff_after_emit": "superpowers"`
- [ ] 后续可由 `superpowers:executing-plans` 或 `superpowers:subagent-driven-development` 执行 implementation plan

## 5. 文档完整性

- [ ] `figma-workflow/SKILL.md` 存在
- [ ] `figma-workflow/README.md` 存在
- [ ] `figma-workflow/tests/fixtures/progress-states/` 存在
- [ ] `figma-ui-api-mapper/SKILL.md` 存在
- [ ] `figma-ui-api-mapper/README.md` 存在
- [ ] `figma-ui-api-mapper/tests/fixtures/course-list/` 存在
- [ ] `figma-design-token/SKILL.md` 存在
- [ ] `figma-design-token/README.md` 存在
- [ ] `figma-design-token/tests/fixtures/referral-home/` 存在
- [ ] `figma-emit-spec/SKILL.md` 存在
- [ ] `figma-emit-spec/README.md` 存在
- [ ] `figma-emit-spec/tests/fixtures/referral-home/` 存在

## 6. 人工 review 结论

Reviewer:

```text
<!-- TODO: 填写 reviewer 名称 / 日期 -->
```

结论:

```text
<!-- TODO: PASS / PASS_WITH_NOTES / FAIL -->
```

备注:

```text
<!-- TODO: 填写人工 review 发现的问题或确认说明 -->
```
