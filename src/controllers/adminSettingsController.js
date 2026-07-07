import { SystemSetting } from '../models/index.js';

export const getGlobalSettings = async (req, res) => {
  try {
    const settings = await SystemSetting.findAll();
    const settingsObj = {};
    settings.forEach(s => settingsObj[s.key] = s.value);
    res.json({ success: true, data: settingsObj });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateGlobalSettings = async (req, res) => {
  try {
    const { settings } = req.body; // e.g. { GRACE_PERIOD_DAYS: 7 }
    for (const [key, value] of Object.entries(settings)) {
      let setting = await SystemSetting.findOne({ where: { key } });
      if (setting) {
        setting.value = String(value);
        await setting.save();
      } else {
        await SystemSetting.create({ key, value: String(value) });
      }
    }
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
