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
  type: 'REPORT_SUBMITTED' | 'ORDER_RECEIVED' | 'PROJECT_ASSIGNED' | 'PROJECT_COMPLETED' | 'INVENTORY_LOW_STOCK' | 'INVENTORY_OUT_OF_STOCK'
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

/**
 * 在庫不足時の通知を作成（すべてのVAXAL社員に通知）
 */
export async function notifyInventoryLowStock(inventoryItemName: string, currentStock: number, threshold: number) {
  try {
    // すべてのVAXAL社員を取得
    const vaxalUsers = await prisma.vaxalUser.findMany()

    // 各VAXAL社員に通知を作成
    for (const user of vaxalUsers) {
      await createNotification({
        type: 'INVENTORY_LOW_STOCK',
        title: '在庫が要発注レベルです',
        message: `${inventoryItemName} の在庫が要発注レベルになりました。現在の在庫数: ${currentStock}、閾値: ${threshold}`,
        vaxalUserId: user.id,
      })
    }
  } catch (error) {
    console.error('在庫不足通知作成エラー:', error)
  }
}

/**
 * 在庫切れ時の通知を作成（すべてのVAXAL社員に通知）
 */
export async function notifyInventoryOutOfStock(inventoryItemName: string) {
  try {
    // すべてのVAXAL社員を取得
    const vaxalUsers = await prisma.vaxalUser.findMany()

    // 各VAXAL社員に通知を作成
    for (const user of vaxalUsers) {
      await createNotification({
        type: 'INVENTORY_OUT_OF_STOCK',
        title: '在庫切れが発生しました',
        message: `${inventoryItemName} の在庫が切れました。至急発注してください。`,
        vaxalUserId: user.id,
      })
    }
  } catch (error) {
    console.error('在庫切れ通知作成エラー:', error)
  }
}
