import bpy, math, os, mathutils

# Clear scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()
for m in list(bpy.data.materials): bpy.data.materials.remove(m)

# Font
bold_font = None
for f in ["C:/Windows/Fonts/impact.ttf", "C:/Windows/Fonts/ariblk.ttf", "C:/Windows/Fonts/arialbd.ttf"]:
    if os.path.exists(f):
        bold_font = bpy.data.fonts.load(f)
        break

# PROMPT text - thin extrusion for readability
bpy.ops.object.text_add(location=(0, 0, 0.55))
p = bpy.context.active_object
p.data.body = "PROMPT"
p.data.size = 0.9
p.data.extrude = 0.04
p.data.bevel_depth = 0.008
p.data.bevel_resolution = 2
p.data.align_x = "CENTER"
p.data.align_y = "CENTER"
p.data.space_character = 1.15
p.name = "PromptText"
if bold_font: p.data.font = bold_font

# VAULT text
bpy.ops.object.text_add(location=(0, 0, -0.55))
v = bpy.context.active_object
v.data.body = "VAULT"
v.data.size = 1.15
v.data.extrude = 0.05
v.data.bevel_depth = 0.01
v.data.bevel_resolution = 2
v.data.align_x = "CENTER"
v.data.align_y = "CENTER"
v.data.space_character = 1.2
v.name = "VaultText"
if bold_font: v.data.font = bold_font

# Materials
mat1 = bpy.data.materials.new(name="Gold")
mat1.use_nodes = True
b1 = mat1.node_tree.nodes["Principled BSDF"]
b1.inputs["Base Color"].default_value = (1.0, 0.84, 0.35, 1.0)
b1.inputs["Metallic"].default_value = 1.0
b1.inputs["Roughness"].default_value = 0.12
b1.inputs["Emission Color"].default_value = (0.78, 1.0, 0.0, 1.0)
b1.inputs["Emission Strength"].default_value = 0.1

mat2 = bpy.data.materials.new(name="BrightGold")
mat2.use_nodes = True
b2 = mat2.node_tree.nodes["Principled BSDF"]
b2.inputs["Base Color"].default_value = (1.0, 0.93, 0.3, 1.0)
b2.inputs["Metallic"].default_value = 1.0
b2.inputs["Roughness"].default_value = 0.08
b2.inputs["Emission Color"].default_value = (0.78, 1.0, 0.0, 1.0)
b2.inputs["Emission Strength"].default_value = 0.15

p.data.materials.append(mat1)
v.data.materials.append(mat2)

# Convert + smooth
for obj in [p, v]:
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.convert(target="MESH")
    bpy.ops.object.shade_smooth()

# Camera - frontal, slightly above
bpy.ops.object.camera_add(location=(0, -7, 0.3))
cam = bpy.context.active_object
direction = mathutils.Vector((0, 0, 0)) - cam.location
cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
cam.data.lens = 65
bpy.context.scene.camera = cam

# Lights
bpy.ops.object.light_add(type="AREA", location=(3, -4, 5))
bpy.context.active_object.data.energy = 2500
bpy.context.active_object.data.size = 5
bpy.ops.object.light_add(type="AREA", location=(-3, -2, 3))
bpy.context.active_object.data.energy = 1000
bpy.context.active_object.data.size = 3
bpy.ops.object.light_add(type="AREA", location=(0, 3, 1))
bpy.context.active_object.data.energy = 600
bpy.context.active_object.data.color = (0.78, 1.0, 0.0)
# Front fill
bpy.ops.object.light_add(type="AREA", location=(0, -5, 0))
bpy.context.active_object.data.energy = 800
bpy.context.active_object.data.size = 6

# World
w = bpy.data.worlds.get("World") or bpy.data.worlds.new("World")
bpy.context.scene.world = w
w.use_nodes = True
bg = w.node_tree.nodes["Background"]
bg.inputs[0].default_value = (0.05, 0.05, 0.05, 1)
bg.inputs[1].default_value = 0.2

# Render settings
bpy.context.scene.render.engine = "BLENDER_EEVEE"
bpy.context.scene.render.resolution_x = 1920
bpy.context.scene.render.resolution_y = 1080
bpy.context.scene.render.film_transparent = True
bpy.context.scene.render.image_settings.file_format = "PNG"
bpy.context.scene.render.image_settings.color_mode = "RGBA"

# Static render
output = os.path.join(os.path.expanduser("~"), "Desktop", "prompt-vault", "public", "assets", "logo-3d.png")
bpy.context.scene.render.filepath = output
bpy.ops.render.render(write_still=True)
print(f"Logo rendered: {output}")

# Save blend
blend_path = os.path.join(os.path.expanduser("~"), "Desktop", "prompt_vault_logo_v2.blend")
bpy.ops.wm.save_as_mainfile(filepath=blend_path)

# Now render animation - slow Y rotation over 120 frames (5 sec at 24fps)
bpy.context.scene.frame_start = 1
bpy.context.scene.frame_end = 120
bpy.context.scene.render.fps = 24

# Parent both text objects to an empty for rotation
bpy.ops.object.empty_add(location=(0, 0, 0))
pivot = bpy.context.active_object
pivot.name = "Pivot"

for name in ["PromptText", "VaultText"]:
    obj = bpy.data.objects.get(name)
    if obj:
        obj.parent = pivot

# Keyframe rotation
pivot.rotation_euler = (0, 0, 0)
pivot.keyframe_insert(data_path="rotation_euler", frame=1)
pivot.rotation_euler = (0, 0, math.radians(360))
pivot.keyframe_insert(data_path="rotation_euler", frame=121)

# Make linear interpolation for smooth loop
for fc in pivot.animation_data.action.fcurves:
    for kp in fc.keyframe_points:
        kp.interpolation = 'LINEAR'

# Render video
bpy.context.scene.render.film_transparent = False
bg.inputs[0].default_value = (0.04, 0.04, 0.04, 1)
bg.inputs[1].default_value = 1.0
bpy.context.scene.render.image_settings.file_format = "FFMPEG"
bpy.context.scene.render.ffmpeg.format = "MPEG4"
bpy.context.scene.render.ffmpeg.codec = "H264"
bpy.context.scene.render.ffmpeg.constant_rate_factor = "HIGH"
bpy.context.scene.render.resolution_x = 1280
bpy.context.scene.render.resolution_y = 400

video_output = os.path.join(os.path.expanduser("~"), "Desktop", "prompt-vault", "public", "assets", "logo-spin.mp4")
bpy.context.scene.render.filepath = video_output
bpy.ops.render.render(animation=True)
print(f"Video rendered: {video_output}")
