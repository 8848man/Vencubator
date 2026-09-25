// 배정 페이지 진입 코드 (빌드 시 track.mjs, assign.mjs 뒤에 이어 붙는다)
(() => {
  const stored = readAssignment();
  const r = resolveVariant({ search: location.search, stored });
  captureUtm(location.search);
  if (r.write) {
    const a = { v: 1, visitor: stored?.visitor || uuid(), variant: r.variant, source: r.source, at: Date.now() };
    const sticky = writeAssignment(undefined, a);
    track('experiment_assigned', { source: r.source, sticky }, { page: 'router' });
  }
  location.replace(targetUrl(r.variant, location.search, location.hash));
})();
