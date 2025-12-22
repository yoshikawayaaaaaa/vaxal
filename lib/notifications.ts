import { prisma } from './prisma'

/**
 * 通知を作成するヘルパー関数
 */
export async function createNotification({
  type,
  title,
  message,
  projectId,
  vaxalUserId,
  engineerUserId,
}: {
  type: 'REPORT_SUBMITTED' | 'ORDER_RECEIVED' | 'PROJECT_ASSIGNED' | 'PROJECT_COMPLETED'
  title: string
  message: string
  projectId?: string
  vaxalUserId?: string
  engineerUserId?: string
}) {
  try {
    await prisma.notification.create({
      data: {
        type,
        title,
        message,
        projectId,
        vaxalUserId,
        engineerUserId,
      },
    })
  } catch (error) {
    console.error('通知作成エラー:', error)
  }
}

/**
 * 報告提出時の通知を作成
 */
export async function notifyReportSubmitted(projectId: string, projectNumber: string) {
  // プロジェクトを作成したVAXAL社員に通知
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { createdByVaxalId: true },
  })

  if (project) {
    await createNotification({
      type: 'REPORT_SUBMITTED',
      title: '報告が提出されました',
      message: `案件番号 ${projectNumber} の報告が提出されました。`,
      projectId,
      vaxalUserId: project.createdByVaxalId,
    })
  }
}

/**
 * 注文受付時の通知を作成
 */
export async function notifyOrderReceived(projectId: string, projectNumber: string, vaxalUserId: string) {
  await createNotification({
    type: 'ORDER_RECEIVED',
    title: '新しい注文を受け付けました',
    message: `案件番号 ${projectNumber} の注文を受け付けました。`,
    projectId,
    vaxalUserId,
  })
}

/**
 * 案件割り振り時の通知を作成
 */
export async function notifyProjectAssigned(projectId: string, projectNumber: string, engineerUserId: string) {
  await createNotification({
    type: 'PROJECT_ASSIGNED',
    title: '新しい案件が割り振られました',
    message: `案件番号 ${projectNumber} が割り振られました。`,
    projectId,
    engineerUserId,
  })
}

/**
 * 案件完了時の通知を作成
 */
export async function notifyProjectCompleted(projectId: string, projectNumber: string, engineerUserId: string) {
  await createNotification({
    type: 'PROJECT_COMPLETED',
    title: '案件が完了しました',
    message: `案件番号 ${projectNumber} が完了しました。`,
    projectId,
    engineerUserId,
  })
}
