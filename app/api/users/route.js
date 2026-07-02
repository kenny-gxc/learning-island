import { getAllUsers, findUserByName, createUser } from '@/lib/db';

export async function GET() {
  try {
    const users = await getAllUsers();
    return Response.json({ success: true, users });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return Response.json({ success: false, error: '获取用户列表失败' });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return Response.json({ success: false, error: '请输入名字' });
    }

    const cleanName = name.trim();

    const existing = await findUserByName(cleanName);
    if (existing) {
      return Response.json({ success: true, user: existing, isNew: false });
    }

    const user = await createUser(cleanName);

    return Response.json({
      success: true,
      user,
      isNew: true,
    });
  } catch (error) {
    console.error('创建用户失败:', error);
    return Response.json({ success: false, error: '操作失败，请重试' });
  }
}
