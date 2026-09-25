# Work Item 실행 기록

실제 W 착수 시 [양식](../../templates/SDD-TEMPLATES.md)을 사용해 `W-ID.md`를 만든다. 현재 앱 구현 W는 모두 미착수이므로 개별 파일은 아직 없다. Phase의 작업표와 STATE에 등록된 42개 초기 ID가 범위의 출발점이다.

각 파일에는 ID·Stage/Phase·관련 Spec revision·승인 근거·목표·비목표·선행조건·변경 예정 파일·AC·검증 절차·중단 경계를 적는다. 실시간 status는 STATE에만 기록하고 해당 파일에는 링크한다. 수행 결과는 CP/VAL에서 찾는다.

큰 W를 분할할 때는 STATE에 children과 새 ID를 등록하고 원래 W는 집계용 container로 표시한다. 하위 W의 실제 검증이 끝나야 부모를 완료할 수 있다. 준비 문서 작성이 해당 구현 W 완료를 뜻하지 않는다.
