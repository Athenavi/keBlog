-- Seed initial data for roles and permissions

-- Insert default roles
INSERT INTO public.roles (name, description)
VALUES ('admin', 'Administrator with full access'),
       ('moderator', 'Content moderator'),
       ('user', 'Regular user'),
       ('author', 'Content author') ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO public.permissions (code, description)
VALUES ('user.create', 'Create user accounts'),
       ('user.read', 'Read user information'),
       ('user.update', 'Update user information'),
       ('user.delete', 'Delete user accounts'),
       ('article.create', 'Create articles'),
       ('article.read', 'Read articles'),
       ('article.update', 'Update articles'),
       ('article.delete', 'Delete articles'),
       ('article.publish', 'Publish articles'),
       ('comment.create', 'Create comments'),
       ('comment.read', 'Read comments'),
       ('comment.update', 'Update comments'),
       ('comment.delete', 'Delete comments'),
       ('comment.moderate', 'Moderate comments'),
       ('media.upload', 'Upload media files'),
       ('media.delete', 'Delete media files'),
       ('admin.access', 'Access admin panel'),
       ('moderate.content', 'Moderate content') ON CONFLICT (code) DO NOTHING;

-- Assign permissions to roles
WITH role_permission_mapping AS (SELECT r.id as role_id,
                                        p.id as permission_id
                                 FROM public.roles r
                                          CROSS JOIN public.permissions p
                                 WHERE (r.name = 'admin')
                                    OR (r.name = 'moderator' AND p.code IN
                                                                 ('article.read', 'comment.read', 'comment.moderate',
                                                                  'moderate.content'))
                                    OR (r.name = 'author' AND p.code IN
                                                              ('article.create', 'article.read', 'article.update',
                                                               'article.publish', 'comment.create', 'comment.read',
                                                               'media.upload'))
                                    OR (r.name = 'user' AND
                                        p.code IN ('article.read', 'comment.create', 'comment.read', 'user.read')))
INSERT
INTO public.role_permissions (role_id, permission_id)
SELECT role_id, permission_id
FROM role_permission_mapping ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Insert default categories
INSERT INTO public.categories (name)
VALUES ('Technology'),
       ('Science'),
       ('Arts'),
       ('Sports'),
       ('News'),
       ('Entertainment') ON CONFLICT DO NOTHING;
