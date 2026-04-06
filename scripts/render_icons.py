import bpy, os, math, mathutils

def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

def add_lights():
    bpy.ops.object.light_add(type='AREA', location=(3, -2, 4))
    key = bpy.context.active_object
    key.data.energy = 3000
    key.data.size = 3
    key.data.color = (1.0, 0.95, 0.85)
    bpy.ops.object.light_add(type='AREA', location=(-2, -1, 2))
    fill = bpy.context.active_object
    fill.data.energy = 1000
    fill.data.size = 2
    bpy.ops.object.light_add(type='AREA', location=(0, 2, 3))
    rim = bpy.context.active_object
    rim.data.energy = 1500
    rim.data.color = (0.78, 1.0, 0.0)

def add_camera(dist=5):
    bpy.ops.object.camera_add(location=(dist*0.6, -dist, dist*0.4))
    cam = bpy.context.active_object
    direction = mathutils.Vector((0, 0, 0.3)) - cam.location
    cam.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
    cam.data.lens = 50
    bpy.context.scene.camera = cam

def gold_mat(name, color=(1.0, 0.84, 0.35, 1.0)):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    b = mat.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = color
    b.inputs['Metallic'].default_value = 1.0
    b.inputs['Roughness'].default_value = 0.08
    b.inputs['Emission Color'].default_value = (0.78, 1.0, 0.0, 1.0)
    b.inputs['Emission Strength'].default_value = 0.15
    return mat

def setup_render(path):
    bpy.context.scene.render.engine = 'BLENDER_EEVEE'
    bpy.context.scene.render.resolution_x = 512
    bpy.context.scene.render.resolution_y = 512
    bpy.context.scene.render.film_transparent = True
    bpy.context.scene.render.image_settings.file_format = 'PNG'
    bpy.context.scene.render.image_settings.color_mode = 'RGBA'
    bpy.context.scene.render.filepath = path
    w = bpy.context.scene.world or bpy.data.worlds.new('World')
    bpy.context.scene.world = w
    w.use_nodes = True
    bg = w.node_tree.nodes['Background']
    bg.inputs[0].default_value = (0.1, 0.1, 0.1, 1)
    bg.inputs[1].default_value = 0.3

outdir = os.path.join(os.path.expanduser('~'), 'Desktop', 'prompt-vault', 'public', 'assets', 'icons')
os.makedirs(outdir, exist_ok=True)

# 1. CINEMATIC - Film camera body + lens
clear_scene(); add_lights(); add_camera(4)
m = gold_mat('G1')
bpy.ops.mesh.primitive_cube_add(size=1.5, location=(0, 0, 0))
bpy.context.active_object.scale = (1.2, 0.8, 0.7)
bpy.context.active_object.data.materials.append(m)
bpy.ops.object.shade_smooth()
bpy.ops.mesh.primitive_cylinder_add(radius=0.35, depth=0.8, location=(1.2, 0, 0.1))
bpy.context.active_object.rotation_euler = (0, math.radians(90), 0)
bpy.context.active_object.data.materials.append(m)
bpy.ops.object.shade_smooth()
setup_render(os.path.join(outdir, 'cinematic.png'))
bpy.ops.render.render(write_still=True)
print('cinematic done')

# 2. LIVE-ACTION - Person silhouette
clear_scene(); add_lights(); add_camera(4)
m = gold_mat('G2')
bpy.ops.mesh.primitive_cylinder_add(radius=0.3, depth=1.5, location=(0, 0, 0.75))
bpy.context.active_object.data.materials.append(m)
bpy.ops.object.shade_smooth()
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.35, location=(0, 0, 1.8))
bpy.context.active_object.data.materials.append(m)
bpy.ops.object.shade_smooth()
bpy.ops.mesh.primitive_cylinder_add(radius=0.1, depth=1.0, location=(0.5, 0, 1.1))
bpy.context.active_object.rotation_euler = (0, 0, math.radians(30))
bpy.context.active_object.data.materials.append(m)
bpy.ops.mesh.primitive_cylinder_add(radius=0.1, depth=1.0, location=(-0.5, 0, 1.1))
bpy.context.active_object.rotation_euler = (0, 0, math.radians(-30))
bpy.context.active_object.data.materials.append(m)
setup_render(os.path.join(outdir, 'live-action.png'))
bpy.ops.render.render(write_still=True)
print('live-action done')

# 3. PRODUCT - Box with bow
clear_scene(); add_lights(); add_camera(4)
m = gold_mat('G3')
bpy.ops.mesh.primitive_cube_add(size=1.5, location=(0, 0, 0.75))
bpy.context.active_object.scale = (0.8, 0.6, 1.0)
bpy.context.active_object.data.materials.append(m)
bpy.ops.object.shade_smooth()
bpy.ops.mesh.primitive_torus_add(major_radius=0.3, minor_radius=0.05, location=(0, -0.45, 1.6))
bpy.context.active_object.rotation_euler = (math.radians(90), 0, 0)
bpy.context.active_object.scale = (1, 1, 0.6)
bpy.context.active_object.data.materials.append(m)
bpy.ops.object.shade_smooth()
setup_render(os.path.join(outdir, 'product.png'))
bpy.ops.render.render(write_still=True)
print('product done')

# 4. UGC - Phone
clear_scene(); add_lights(); add_camera(4)
m = gold_mat('G4')
bpy.ops.mesh.primitive_cube_add(size=1.5, location=(0, 0, 0.75))
bpy.context.active_object.scale = (0.45, 0.08, 0.9)
bpy.context.active_object.data.materials.append(m)
bpy.ops.object.shade_smooth()
setup_render(os.path.join(outdir, 'ugc.png'))
bpy.ops.render.render(write_still=True)
print('ugc done')

# 5. CAMERA MOVEMENTS - Dolly on rail
clear_scene(); add_lights(); add_camera(5)
m = gold_mat('G5')
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.1))
bpy.context.active_object.scale = (3, 0.15, 0.1)
bpy.context.active_object.data.materials.append(m)
bpy.ops.object.shade_smooth()
bpy.ops.mesh.primitive_cube_add(size=0.8, location=(0.5, 0, 0.7))
bpy.context.active_object.scale = (0.6, 0.4, 0.4)
bpy.context.active_object.data.materials.append(m)
bpy.ops.object.shade_smooth()
for x in [-1.5, -0.5, 0.5, 1.5]:
    bpy.ops.mesh.primitive_cylinder_add(radius=0.12, depth=0.2, location=(x, 0.2, 0.12))
    bpy.context.active_object.rotation_euler = (math.radians(90), 0, 0)
    bpy.context.active_object.data.materials.append(m)
setup_render(os.path.join(outdir, 'camera-movements.png'))
bpy.ops.render.render(write_still=True)
print('camera-movements done')

# 6. ATMOSPHERIC - Flame
clear_scene(); add_lights(); add_camera(4)
m1 = gold_mat('G6a', color=(1.0, 0.6, 0.1, 1.0))
m2 = gold_mat('G6b', color=(1.0, 0.3, 0.05, 1.0))
bpy.ops.mesh.primitive_cone_add(radius1=0.6, radius2=0.05, depth=2.0, location=(0, 0, 1))
bpy.context.active_object.data.materials.append(m1)
bpy.ops.object.shade_smooth()
bpy.ops.mesh.primitive_cone_add(radius1=0.4, radius2=0.02, depth=1.5, location=(0.3, 0.1, 0.8))
bpy.context.active_object.rotation_euler = (0, math.radians(10), math.radians(15))
bpy.context.active_object.data.materials.append(m2)
bpy.ops.object.shade_smooth()
bpy.ops.mesh.primitive_cone_add(radius1=0.35, radius2=0.02, depth=1.3, location=(-0.2, -0.1, 0.7))
bpy.context.active_object.rotation_euler = (0, math.radians(-8), math.radians(-10))
bpy.context.active_object.data.materials.append(m1)
bpy.ops.object.shade_smooth()
setup_render(os.path.join(outdir, 'atmospheric.png'))
bpy.ops.render.render(write_still=True)
print('atmospheric done')

print('ALL 6 ICONS RENDERED')
